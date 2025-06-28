-- Character Field Protection Rules Schema
-- Defines protection levels and validation rules for character attributes

CREATE TABLE IF NOT EXISTS character_field_rules (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- JSONB path targeting (e.g., 'appearance.hair.color', 'personality.core_traits')
    field_path TEXT NOT NULL UNIQUE,
    
    -- Protection level: immutable, protected, mutable
    protection_level VARCHAR(20) NOT NULL CHECK (protection_level IN ('immutable', 'protected', 'mutable')),
    
    -- Minimum confidence score required for updates (0.0 - 1.0)
    min_confidence DECIMAL(3,2) NOT NULL DEFAULT 0.5 CHECK (min_confidence >= 0.0 AND min_confidence <= 1.0),
    
    -- Human-readable reason for protection
    protection_reason TEXT,
    
    -- Maximum number of changes allowed per adventure (NULL = unlimited)
    max_changes_per_adventure INTEGER CHECK (max_changes_per_adventure >= 0),
    
    -- Cooldown period between changes in minutes (NULL = no cooldown)
    change_cooldown_minutes INTEGER CHECK (change_cooldown_minutes >= 0),
    
    -- Whether this rule requires explicit mention in text (not inference)
    requires_explicit_mention BOOLEAN NOT NULL DEFAULT true,
    
    -- Whether character must be the agent of change (vs external description)
    requires_character_agency BOOLEAN NOT NULL DEFAULT true,
    
    -- Rule is active
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Optional: category grouping for rule management
    category VARCHAR(50),
    
    -- Optional: rule priority (higher number = higher priority)
    priority INTEGER NOT NULL DEFAULT 100
);

-- Index for fast field_path lookups
CREATE INDEX IF NOT EXISTS idx_character_field_rules_path ON character_field_rules(field_path);
CREATE INDEX IF NOT EXISTS idx_character_field_rules_active ON character_field_rules(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_character_field_rules_category ON character_field_rules(category);

-- Table to track field changes per adventure for rate limiting
CREATE TABLE IF NOT EXISTS character_field_changes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Reference to adventure character instance
    adventure_character_id TEXT NOT NULL,
    
    -- Field that was changed
    field_path TEXT NOT NULL,
    
    -- Previous and new values (for audit/rollback)
    previous_value JSONB,
    new_value JSONB,
    
    -- Confidence score of the change
    confidence_score DECIMAL(3,2) NOT NULL,
    
    -- Source text that triggered the change
    source_text TEXT,
    
    -- Whether this was an automatic LLM extraction or manual update
    change_source VARCHAR(20) NOT NULL DEFAULT 'llm_extraction' CHECK (change_source IN ('llm_extraction', 'manual_update', 'system_correction')),
    
    -- Timestamps
    changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Reference to the message that triggered this change (if applicable)
    triggering_message_id TEXT,
    
    FOREIGN KEY (adventure_character_id) REFERENCES adventure_characters(id) ON DELETE CASCADE
);

-- Indexes for change tracking and rate limiting
CREATE INDEX IF NOT EXISTS idx_character_field_changes_adventure_char ON character_field_changes(adventure_character_id);
CREATE INDEX IF NOT EXISTS idx_character_field_changes_field_path ON character_field_changes(field_path);
CREATE INDEX IF NOT EXISTS idx_character_field_changes_timestamp ON character_field_changes(changed_at);
CREATE INDEX IF NOT EXISTS idx_character_field_changes_rate_limit ON character_field_changes(adventure_character_id, field_path, changed_at);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_character_field_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER character_field_rules_updated_at
    BEFORE UPDATE ON character_field_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_character_field_rules_updated_at();

-- Insert default protection rules
INSERT INTO character_field_rules (field_path, protection_level, min_confidence, protection_reason, requires_explicit_mention, requires_character_agency, category, priority) VALUES
    -- Immutable genetic/physical traits
    ('appearance.eye.color', 'immutable', 0.9, 'Genetic trait that cannot change naturally', true, true, 'genetics', 1000),
    ('appearance.skin.color', 'immutable', 0.9, 'Genetic trait that cannot change naturally', true, true, 'genetics', 1000),
    ('appearance.height.measurement', 'immutable', 0.9, 'Physical characteristic that does not change in adults', true, true, 'genetics', 1000),
    ('personality.core_traits', 'immutable', 0.95, 'Fundamental personality traits that define character identity', true, true, 'core_identity', 1000),
    
    -- Protected traits (high confidence required)
    ('appearance.hair.color', 'protected', 0.8, 'Hair color changes should be intentional and explicit', true, true, 'changeable_appearance', 500),
    ('appearance.body.type', 'protected', 0.85, 'Body type changes require significant life events', true, true, 'physical', 500),
    ('personality.beliefs', 'protected', 0.8, 'Core beliefs change slowly and with strong reason', true, true, 'psychology', 500),
    ('personality.values', 'protected', 0.8, 'Personal values are deeply held and change slowly', true, true, 'psychology', 500),
    
    -- Semi-protected (medium confidence)
    ('appearance.hair.length', 'protected', 0.6, 'Hair length can change but should be intentional', true, true, 'changeable_appearance', 300),
    ('appearance.weight', 'protected', 0.7, 'Weight changes should be gradual and realistic', false, false, 'physical', 300),
    ('personality.habits', 'protected', 0.6, 'Habits can change but usually require effort', false, false, 'behavior', 300),
    
    -- Mutable traits (low confidence acceptable)
    ('appearance.hair.style', 'mutable', 0.3, 'Hair style can change frequently', false, true, 'changeable_appearance', 100),
    ('appearance.clothes.current', 'mutable', 0.2, 'Clothing changes throughout the day', false, false, 'temporary', 100),
    ('appearance.makeup.current', 'mutable', 0.2, 'Makeup can be applied and removed', false, true, 'temporary', 100),
    ('personality.mood', 'mutable', 0.2, 'Mood changes frequently based on circumstances', false, false, 'emotional_state', 100),
    ('personality.energy_level', 'mutable', 0.2, 'Energy levels fluctuate throughout the day', false, false, 'emotional_state', 100),
    ('scents_aromas.temporary', 'mutable', 0.3, 'Temporary scents from environment or activities', false, false, 'temporary', 100),
    
    -- Situational attributes
    ('location.current', 'mutable', 0.2, 'Current location changes as character moves', false, false, 'situational', 50),
    ('actions.recent', 'mutable', 0.1, 'Recent actions are constantly updating', false, false, 'situational', 50)
ON CONFLICT (field_path) DO NOTHING;

-- Create function to check if a field change is allowed
CREATE OR REPLACE FUNCTION is_field_change_allowed(
    p_adventure_character_id TEXT,
    p_field_path TEXT,
    p_confidence_score DECIMAL(3,2),
    p_requires_explicit BOOLEAN DEFAULT false,
    p_has_character_agency BOOLEAN DEFAULT false
) RETURNS TABLE(
    allowed BOOLEAN,
    reason TEXT,
    rule_id TEXT
) AS $$
DECLARE
    rule_record RECORD;
    change_count INTEGER;
    last_change_time TIMESTAMPTZ;
BEGIN
    -- Get the protection rule for this field
    SELECT * INTO rule_record
    FROM character_field_rules 
    WHERE field_path = p_field_path 
        AND is_active = true
    ORDER BY priority DESC
    LIMIT 1;
    
    -- If no rule found, allow change (default permissive)
    IF rule_record IS NULL THEN
        RETURN QUERY SELECT true, 'No protection rule defined', NULL::TEXT;
        RETURN;
    END IF;
    
    -- Check protection level
    IF rule_record.protection_level = 'immutable' THEN
        RETURN QUERY SELECT false, 'Field is immutable: ' || rule_record.protection_reason, rule_record.id;
        RETURN;
    END IF;
    
    -- Check confidence score
    IF p_confidence_score < rule_record.min_confidence THEN
        RETURN QUERY SELECT false, 'Confidence score too low: ' || p_confidence_score || ' < ' || rule_record.min_confidence, rule_record.id;
        RETURN;
    END IF;
    
    -- Check explicit mention requirement
    IF rule_record.requires_explicit_mention AND NOT p_requires_explicit THEN
        RETURN QUERY SELECT false, 'Field requires explicit mention in text', rule_record.id;
        RETURN;
    END IF;
    
    -- Check character agency requirement
    IF rule_record.requires_character_agency AND NOT p_has_character_agency THEN
        RETURN QUERY SELECT false, 'Field requires character to be agent of change', rule_record.id;
        RETURN;
    END IF;
    
    -- Check rate limiting (max changes per adventure)
    IF rule_record.max_changes_per_adventure IS NOT NULL THEN
        SELECT COUNT(*) INTO change_count
        FROM character_field_changes
        WHERE adventure_character_id = p_adventure_character_id
            AND field_path = p_field_path;
            
        IF change_count >= rule_record.max_changes_per_adventure THEN
            RETURN QUERY SELECT false, 'Maximum changes per adventure exceeded: ' || change_count, rule_record.id;
            RETURN;
        END IF;
    END IF;
    
    -- Check cooldown period
    IF rule_record.change_cooldown_minutes IS NOT NULL THEN
        SELECT MAX(changed_at) INTO last_change_time
        FROM character_field_changes
        WHERE adventure_character_id = p_adventure_character_id
            AND field_path = p_field_path;
            
        IF last_change_time IS NOT NULL AND 
           last_change_time + INTERVAL '1 minute' * rule_record.change_cooldown_minutes > CURRENT_TIMESTAMP THEN
            RETURN QUERY SELECT false, 'Change cooldown period not yet expired', rule_record.id;
            RETURN;
        END IF;
    END IF;
    
    -- All checks passed
    RETURN QUERY SELECT true, 'Change allowed', rule_record.id;
END;
$$ LANGUAGE plpgsql;

-- Create function to record a field change
CREATE OR REPLACE FUNCTION record_field_change(
    p_adventure_character_id TEXT,
    p_field_path TEXT,
    p_previous_value JSONB,
    p_new_value JSONB,
    p_confidence_score DECIMAL(3,2),
    p_source_text TEXT,
    p_change_source VARCHAR(20) DEFAULT 'llm_extraction',
    p_triggering_message_id TEXT DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
    change_id TEXT;
BEGIN
    INSERT INTO character_field_changes (
        adventure_character_id,
        field_path,
        previous_value,
        new_value,
        confidence_score,
        source_text,
        change_source,
        triggering_message_id
    ) VALUES (
        p_adventure_character_id,
        p_field_path,
        p_previous_value,
        p_new_value,
        p_confidence_score,
        p_source_text,
        p_change_source,
        p_triggering_message_id
    ) RETURNING id INTO change_id;
    
    RETURN change_id;
END;
$$ LANGUAGE plpgsql;