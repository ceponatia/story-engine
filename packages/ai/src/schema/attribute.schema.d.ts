export declare const COMPREHENSIVE_ATTRIBUTE_SCHEMA: {
    readonly height: {
        readonly column: "appearance";
        readonly path: "body.height";
        readonly keywords: readonly ["height", "tall", "short", "size", "stature"];
        readonly aliases: readonly ["how tall", "body height"];
        readonly description: "Character height and overall stature";
    };
    readonly weight: {
        readonly column: "appearance";
        readonly path: "body.weight";
        readonly keywords: readonly ["weight", "heavy", "light", "thin", "fat", "skinny", "chubby"];
        readonly aliases: readonly ["body weight", "build"];
        readonly description: "Character weight and body mass";
    };
    readonly body_type: {
        readonly column: "appearance";
        readonly path: "body.type";
        readonly keywords: readonly ["build", "athletic", "muscular", "slim", "curvy", "stocky"];
        readonly aliases: readonly ["body type", "physique", "figure"];
        readonly description: "Overall body build and physique";
    };
    readonly eye_color: {
        readonly column: "appearance";
        readonly path: "face.eyes.color";
        readonly keywords: readonly ["eyes", "eye", "color", "blue", "green", "brown", "hazel", "amber"];
        readonly aliases: readonly ["eye color", "eye colour"];
        readonly description: "Character eye color";
    };
    readonly eye_shape: {
        readonly column: "appearance";
        readonly path: "face.eyes.shape";
        readonly keywords: readonly ["eyes", "eye", "shape", "almond", "round", "narrow"];
        readonly aliases: readonly ["eye shape"];
        readonly description: "Shape and appearance of eyes";
    };
    readonly hair_color: {
        readonly column: "appearance";
        readonly path: "hair.color";
        readonly keywords: readonly ["hair", "color", "brown", "blonde", "black", "red", "silver", "gray"];
        readonly aliases: readonly ["hair color", "hair colour"];
        readonly description: "Character hair color";
    };
    readonly hair_style: {
        readonly column: "appearance";
        readonly path: "hair.style";
        readonly keywords: readonly ["hair", "style", "long", "short", "curly", "straight", "braided", "ponytail", "bob"];
        readonly aliases: readonly ["hairstyle", "hair style"];
        readonly description: "Character hair styling and arrangement";
    };
    readonly hair_length: {
        readonly column: "appearance";
        readonly path: "hair.length";
        readonly keywords: readonly ["hair", "length", "long", "short", "medium", "shoulder"];
        readonly aliases: readonly ["hair length"];
        readonly description: "Length of character hair";
    };
    readonly hair_texture: {
        readonly column: "appearance";
        readonly path: "hair.texture";
        readonly keywords: readonly ["hair", "texture", "curly", "straight", "wavy", "coarse", "fine"];
        readonly aliases: readonly ["hair texture"];
        readonly description: "Texture and feel of character hair";
    };
    readonly facial_hair: {
        readonly column: "appearance";
        readonly path: "face.facial_hair";
        readonly keywords: readonly ["beard", "mustache", "goatee", "stubble", "facial hair"];
        readonly aliases: readonly ["facial hair", "beard", "mustache"];
        readonly description: "Facial hair style and appearance";
    };
    readonly nose_shape: {
        readonly column: "appearance";
        readonly path: "face.nose.shape";
        readonly keywords: readonly ["nose", "shape", "pointed", "button", "aquiline", "straight"];
        readonly aliases: readonly ["nose shape"];
        readonly description: "Shape and size of nose";
    };
    readonly lips: {
        readonly column: "appearance";
        readonly path: "face.lips";
        readonly keywords: readonly ["lips", "mouth", "full", "thin", "pouty", "smile"];
        readonly aliases: readonly ["lip shape", "mouth"];
        readonly description: "Lip shape and mouth appearance";
    };
    readonly skin_tone: {
        readonly column: "appearance";
        readonly path: "skin.tone";
        readonly keywords: readonly ["skin", "tone", "pale", "dark", "olive", "tan", "complexion"];
        readonly aliases: readonly ["skin tone", "complexion"];
        readonly description: "Character skin color and tone";
    };
    readonly skin_texture: {
        readonly column: "appearance";
        readonly path: "skin.texture";
        readonly keywords: readonly ["skin", "texture", "smooth", "rough", "soft", "weathered"];
        readonly aliases: readonly ["skin texture"];
        readonly description: "Texture and feel of character skin";
    };
    readonly scars: {
        readonly column: "appearance";
        readonly path: "skin.scars";
        readonly keywords: readonly ["scar", "scars", "mark", "marks", "blemish"];
        readonly aliases: readonly ["scars", "markings"];
        readonly description: "Scars and permanent marks on skin";
    };
    readonly tattoos: {
        readonly column: "appearance";
        readonly path: "skin.tattoos";
        readonly keywords: readonly ["tattoo", "tattoos", "ink", "design"];
        readonly aliases: readonly ["tattoos", "body art"];
        readonly description: "Tattoos and body art";
    };
    readonly breast_size: {
        readonly column: "appearance";
        readonly path: "body.chest.size";
        readonly keywords: readonly ["breast", "chest", "bosom", "size", "big", "small", "medium"];
        readonly aliases: readonly ["breast size", "chest size"];
        readonly description: "Size and shape of chest/breasts";
    };
    readonly breast_shape: {
        readonly column: "appearance";
        readonly path: "body.chest.shape";
        readonly keywords: readonly ["breast", "chest", "shape", "round", "perky", "full"];
        readonly aliases: readonly ["breast shape"];
        readonly description: "Shape and appearance of breasts";
    };
    readonly waist: {
        readonly column: "appearance";
        readonly path: "body.waist";
        readonly keywords: readonly ["waist", "waistline", "hips", "curves", "narrow", "wide"];
        readonly aliases: readonly ["waistline"];
        readonly description: "Waist and hip measurements";
    };
    readonly legs: {
        readonly column: "appearance";
        readonly path: "body.legs";
        readonly keywords: readonly ["legs", "thighs", "calves", "long", "short", "muscular"];
        readonly aliases: readonly ["leg shape"];
        readonly description: "Leg shape and appearance";
    };
    readonly arms: {
        readonly column: "appearance";
        readonly path: "body.arms";
        readonly keywords: readonly ["arms", "biceps", "forearms", "muscular", "slender"];
        readonly aliases: readonly ["arm shape"];
        readonly description: "Arm shape and muscle definition";
    };
    readonly feet_size: {
        readonly column: "appearance";
        readonly path: "feet.size";
        readonly keywords: readonly ["feet", "foot", "size", "big", "small", "petite", "large"];
        readonly aliases: readonly ["foot size"];
        readonly description: "Size of character feet";
    };
    readonly feet_shape: {
        readonly column: "appearance";
        readonly path: "feet.shape";
        readonly keywords: readonly ["feet", "foot", "shape", "arch", "wide", "narrow", "delicate"];
        readonly aliases: readonly ["foot shape"];
        readonly description: "Shape and structure of feet";
    };
    readonly feet_nails: {
        readonly column: "appearance";
        readonly path: "feet.nails";
        readonly keywords: readonly ["feet", "foot", "nails", "toenails", "polish", "painted"];
        readonly aliases: readonly ["toenails", "foot nails"];
        readonly description: "Toenail appearance and polish";
    };
    readonly hands: {
        readonly column: "appearance";
        readonly path: "body.hands";
        readonly keywords: readonly ["hands", "fingers", "nails", "manicure", "calluses"];
        readonly aliases: readonly ["hand shape"];
        readonly description: "Hand and finger appearance";
    };
    readonly fingernails: {
        readonly column: "appearance";
        readonly path: "body.hands.nails";
        readonly keywords: readonly ["nails", "fingernails", "manicure", "polish", "length"];
        readonly aliases: readonly ["fingernails", "nail polish"];
        readonly description: "Fingernail appearance and polish";
    };
    readonly voice_pitch: {
        readonly column: "appearance";
        readonly path: "voice.pitch";
        readonly keywords: readonly ["voice", "pitch", "high", "low", "deep", "soprano", "alto"];
        readonly aliases: readonly ["voice pitch"];
        readonly description: "Pitch and tone of speaking voice";
    };
    readonly voice_accent: {
        readonly column: "appearance";
        readonly path: "voice.accent";
        readonly keywords: readonly ["voice", "accent", "dialect", "speech", "pronunciation"];
        readonly aliases: readonly ["accent", "dialect"];
        readonly description: "Speech accent and dialect";
    };
    readonly speech_pattern: {
        readonly column: "appearance";
        readonly path: "voice.speech_pattern";
        readonly keywords: readonly ["speech", "speaking", "voice", "manner", "eloquent", "shy"];
        readonly aliases: readonly ["speech pattern", "speaking style"];
        readonly description: "How character speaks and communicates";
    };
    readonly feet_scents: {
        readonly column: "scents_aromas";
        readonly path: "feet.scents";
        readonly keywords: readonly ["feet", "foot", "smell", "scent", "odor", "aroma", "stinky", "musky"];
        readonly aliases: readonly ["feet smell", "foot odor"];
        readonly description: "Natural scent of character feet";
    };
    readonly feet_intensity: {
        readonly column: "scents_aromas";
        readonly path: "feet.intensity";
        readonly keywords: readonly ["feet", "foot", "smell", "strong", "mild", "intense", "faint"];
        readonly aliases: readonly ["feet smell intensity"];
        readonly description: "Intensity of feet scent";
    };
    readonly body_scent: {
        readonly column: "scents_aromas";
        readonly path: "body.natural";
        readonly keywords: readonly ["body", "smell", "scent", "natural", "musk", "pheromones"];
        readonly aliases: readonly ["body odor", "natural scent"];
        readonly description: "Natural body scent and pheromones";
    };
    readonly hair_scent: {
        readonly column: "scents_aromas";
        readonly path: "hair.scents";
        readonly keywords: readonly ["hair", "shampoo", "scent", "fragrance", "smell"];
        readonly aliases: readonly ["hair smell", "hair fragrance"];
        readonly description: "Scent of character hair and hair products";
    };
    readonly perfume: {
        readonly column: "scents_aromas";
        readonly path: "body.perfume";
        readonly keywords: readonly ["perfume", "cologne", "fragrance", "scent", "floral", "vanilla"];
        readonly aliases: readonly ["fragrance", "cologne"];
        readonly description: "Applied perfumes and fragrances";
    };
    readonly breath: {
        readonly column: "scents_aromas";
        readonly path: "breath";
        readonly keywords: readonly ["breath", "mouth", "mint", "fresh", "morning"];
        readonly aliases: readonly ["breath scent"];
        readonly description: "Scent of character breath";
    };
    readonly intimate_scents: {
        readonly column: "scents_aromas";
        readonly path: "intimate.scents";
        readonly keywords: readonly ["intimate", "private", "personal", "musk"];
        readonly aliases: readonly ["personal scent"];
        readonly description: "Personal intimate scents";
    };
    readonly personality_traits: {
        readonly column: "personality";
        readonly path: "traits";
        readonly keywords: readonly ["personality", "character", "shy", "outgoing", "kind", "mean", "funny"];
        readonly aliases: readonly ["personality traits", "character traits"];
        readonly description: "Core personality characteristics";
    };
    readonly temperament: {
        readonly column: "personality";
        readonly path: "temperament";
        readonly keywords: readonly ["temperament", "mood", "disposition", "nature"];
        readonly aliases: readonly ["disposition"];
        readonly description: "General temperament and disposition";
    };
    readonly emotional_state: {
        readonly column: "personality";
        readonly path: "emotional_state";
        readonly keywords: readonly ["feeling", "emotion", "mood", "happy", "sad", "angry", "excited"];
        readonly aliases: readonly ["mood", "feelings", "emotional state"];
        readonly description: "Current emotional condition";
    };
    readonly dominant_emotion: {
        readonly column: "personality";
        readonly path: "dominant_emotion";
        readonly keywords: readonly ["emotion", "feeling", "usually", "typically", "generally"];
        readonly aliases: readonly ["usual mood"];
        readonly description: "Most common emotional state";
    };
    readonly behavioral_patterns: {
        readonly column: "personality";
        readonly path: "behavioral_patterns";
        readonly keywords: readonly ["behavior", "habits", "patterns", "usual", "typically", "always"];
        readonly aliases: readonly ["behavior patterns", "habits"];
        readonly description: "Behavioral habits and patterns";
    };
    readonly quirks: {
        readonly column: "personality";
        readonly path: "quirks";
        readonly keywords: readonly ["quirk", "quirks", "habit", "peculiar", "unique", "odd"];
        readonly aliases: readonly ["quirks", "odd habits"];
        readonly description: "Unique quirks and mannerisms";
    };
    readonly fears: {
        readonly column: "personality";
        readonly path: "fears";
        readonly keywords: readonly ["fear", "fears", "afraid", "scared", "phobia", "terrified"];
        readonly aliases: readonly ["phobias", "afraid of"];
        readonly description: "Things character is afraid of";
    };
    readonly desires: {
        readonly column: "personality";
        readonly path: "desires";
        readonly keywords: readonly ["desire", "desires", "want", "wants", "wish", "dream"];
        readonly aliases: readonly ["wants", "wishes"];
        readonly description: "Character desires and wants";
    };
    readonly goals: {
        readonly column: "personality";
        readonly path: "goals";
        readonly keywords: readonly ["goal", "goals", "ambition", "dream", "aspire", "hope"];
        readonly aliases: readonly ["ambitions", "aspirations"];
        readonly description: "Character goals and ambitions";
    };
    readonly moral_alignment: {
        readonly column: "personality";
        readonly path: "morality.alignment";
        readonly keywords: readonly ["moral", "morality", "good", "evil", "neutral", "ethics"];
        readonly aliases: readonly ["moral alignment", "ethics"];
        readonly description: "Moral alignment and ethical stance";
    };
    readonly core_values: {
        readonly column: "personality";
        readonly path: "values";
        readonly keywords: readonly ["values", "beliefs", "principles", "important", "stands for"];
        readonly aliases: readonly ["beliefs", "principles"];
        readonly description: "Core values and beliefs";
    };
    readonly virtues: {
        readonly column: "personality";
        readonly path: "virtues";
        readonly keywords: readonly ["virtue", "virtues", "good", "positive", "strength"];
        readonly aliases: readonly ["positive traits", "strengths"];
        readonly description: "Character virtues and positive traits";
    };
    readonly vices: {
        readonly column: "personality";
        readonly path: "vices";
        readonly keywords: readonly ["vice", "vices", "flaw", "flaws", "weakness", "bad"];
        readonly aliases: readonly ["flaws", "weaknesses"];
        readonly description: "Character vices and negative traits";
    };
    readonly intelligence: {
        readonly column: "personality";
        readonly path: "intellect.level";
        readonly keywords: readonly ["smart", "intelligent", "clever", "wise", "brilliant", "genius"];
        readonly aliases: readonly ["intelligence level", "smarts"];
        readonly description: "Character intelligence level";
    };
    readonly education: {
        readonly column: "personality";
        readonly path: "intellect.education";
        readonly keywords: readonly ["education", "school", "university", "learning", "studied"];
        readonly aliases: readonly ["educational background"];
        readonly description: "Educational background and learning";
    };
    readonly skills: {
        readonly column: "personality";
        readonly path: "intellect.skills";
        readonly keywords: readonly ["skill", "skills", "talent", "ability", "good at"];
        readonly aliases: readonly ["talents", "abilities"];
        readonly description: "Character skills and talents";
    };
    readonly background: {
        readonly column: "background";
        readonly path: "";
        readonly keywords: readonly ["background", "history", "past", "story", "origin", "grew up"];
        readonly aliases: readonly ["personal history", "backstory"];
        readonly description: "Character background and personal history";
    };
    readonly occupation: {
        readonly column: "background";
        readonly path: "occupation";
        readonly keywords: readonly ["job", "work", "occupation", "career", "profession", "employed"];
        readonly aliases: readonly ["job", "career", "profession"];
        readonly description: "Character profession or occupation";
    };
    readonly family: {
        readonly column: "background";
        readonly path: "family";
        readonly keywords: readonly ["family", "parents", "siblings", "mother", "father", "relatives"];
        readonly aliases: readonly ["family background", "relatives"];
        readonly description: "Family background and relationships";
    };
    readonly origin: {
        readonly column: "background";
        readonly path: "origin";
        readonly keywords: readonly ["from", "origin", "birthplace", "hometown", "where", "born"];
        readonly aliases: readonly ["birthplace", "hometown"];
        readonly description: "Character origin and birthplace";
    };
    readonly wealth: {
        readonly column: "background";
        readonly path: "wealth";
        readonly keywords: readonly ["money", "rich", "poor", "wealthy", "broke", "income"];
        readonly aliases: readonly ["financial status", "money"];
        readonly description: "Character wealth and financial status";
    };
    readonly living_situation: {
        readonly column: "background";
        readonly path: "living_situation";
        readonly keywords: readonly ["live", "lives", "home", "house", "apartment", "residence"];
        readonly aliases: readonly ["home", "residence"];
        readonly description: "Where and how character lives";
    };
    readonly possessions: {
        readonly column: "background";
        readonly path: "possessions";
        readonly keywords: readonly ["owns", "has", "possession", "belongings", "stuff"];
        readonly aliases: readonly ["belongings", "owns"];
        readonly description: "Important possessions and belongings";
    };
    readonly relationships: {
        readonly column: "background";
        readonly path: "relationships";
        readonly keywords: readonly ["relationship", "relationships", "friends", "enemies", "allies"];
        readonly aliases: readonly ["social connections"];
        readonly description: "Character relationships with others";
    };
    readonly romantic_status: {
        readonly column: "background";
        readonly path: "romantic_status";
        readonly keywords: readonly ["romantic", "dating", "married", "single", "relationship", "boyfriend", "girlfriend"];
        readonly aliases: readonly ["relationship status", "dating"];
        readonly description: "Romantic relationship status";
    };
    readonly clothing_style: {
        readonly column: "appearance";
        readonly path: "clothing.style";
        readonly keywords: readonly ["clothing", "clothes", "style", "fashion", "dress", "outfit"];
        readonly aliases: readonly ["fashion style", "dress style"];
        readonly description: "Character clothing and fashion style";
    };
    readonly current_outfit: {
        readonly column: "appearance";
        readonly path: "clothing.current";
        readonly keywords: readonly ["wearing", "dressed", "outfit", "clothes", "clothing"];
        readonly aliases: readonly ["current outfit", "wearing"];
        readonly description: "Currently worn clothing and outfit";
    };
    readonly accessories: {
        readonly column: "appearance";
        readonly path: "accessories";
        readonly keywords: readonly ["accessories", "jewelry", "watch", "necklace", "earrings", "bracelet"];
        readonly aliases: readonly ["jewelry", "accessories"];
        readonly description: "Worn accessories and jewelry";
    };
    readonly special_abilities: {
        readonly column: "personality";
        readonly path: "abilities.special";
        readonly keywords: readonly ["ability", "abilities", "power", "powers", "magic", "special"];
        readonly aliases: readonly ["powers", "special abilities"];
        readonly description: "Special abilities or supernatural powers";
    };
    readonly weaknesses: {
        readonly column: "personality";
        readonly path: "weaknesses";
        readonly keywords: readonly ["weakness", "weaknesses", "vulnerable", "weak", "limitation"];
        readonly aliases: readonly ["vulnerabilities", "limitations"];
        readonly description: "Character weaknesses and vulnerabilities";
    };
    readonly species: {
        readonly column: "appearance";
        readonly path: "species";
        readonly keywords: readonly ["species", "race", "human", "elf", "dwarf", "creature", "being"];
        readonly aliases: readonly ["race", "creature type"];
        readonly description: "Character species or race";
    };
};
export type AttributeKey = keyof typeof COMPREHENSIVE_ATTRIBUTE_SCHEMA;
export interface AttributeSchema {
    column: "appearance" | "scents_aromas" | "personality" | "background";
    path: string;
    keywords: string[];
    aliases: string[];
    description: string;
}
export declare const ATTRIBUTE_SCHEMA: {
    readonly height: {
        readonly column: "appearance";
        readonly path: "body.height";
        readonly keywords: readonly ["height", "tall", "short", "size", "stature"];
        readonly aliases: readonly ["how tall", "body height"];
        readonly description: "Character height and overall stature";
    };
    readonly weight: {
        readonly column: "appearance";
        readonly path: "body.weight";
        readonly keywords: readonly ["weight", "heavy", "light", "thin", "fat", "skinny", "chubby"];
        readonly aliases: readonly ["body weight", "build"];
        readonly description: "Character weight and body mass";
    };
    readonly body_type: {
        readonly column: "appearance";
        readonly path: "body.type";
        readonly keywords: readonly ["build", "athletic", "muscular", "slim", "curvy", "stocky"];
        readonly aliases: readonly ["body type", "physique", "figure"];
        readonly description: "Overall body build and physique";
    };
    readonly eye_color: {
        readonly column: "appearance";
        readonly path: "face.eyes.color";
        readonly keywords: readonly ["eyes", "eye", "color", "blue", "green", "brown", "hazel", "amber"];
        readonly aliases: readonly ["eye color", "eye colour"];
        readonly description: "Character eye color";
    };
    readonly eye_shape: {
        readonly column: "appearance";
        readonly path: "face.eyes.shape";
        readonly keywords: readonly ["eyes", "eye", "shape", "almond", "round", "narrow"];
        readonly aliases: readonly ["eye shape"];
        readonly description: "Shape and appearance of eyes";
    };
    readonly hair_color: {
        readonly column: "appearance";
        readonly path: "hair.color";
        readonly keywords: readonly ["hair", "color", "brown", "blonde", "black", "red", "silver", "gray"];
        readonly aliases: readonly ["hair color", "hair colour"];
        readonly description: "Character hair color";
    };
    readonly hair_style: {
        readonly column: "appearance";
        readonly path: "hair.style";
        readonly keywords: readonly ["hair", "style", "long", "short", "curly", "straight", "braided", "ponytail", "bob"];
        readonly aliases: readonly ["hairstyle", "hair style"];
        readonly description: "Character hair styling and arrangement";
    };
    readonly hair_length: {
        readonly column: "appearance";
        readonly path: "hair.length";
        readonly keywords: readonly ["hair", "length", "long", "short", "medium", "shoulder"];
        readonly aliases: readonly ["hair length"];
        readonly description: "Length of character hair";
    };
    readonly hair_texture: {
        readonly column: "appearance";
        readonly path: "hair.texture";
        readonly keywords: readonly ["hair", "texture", "curly", "straight", "wavy", "coarse", "fine"];
        readonly aliases: readonly ["hair texture"];
        readonly description: "Texture and feel of character hair";
    };
    readonly facial_hair: {
        readonly column: "appearance";
        readonly path: "face.facial_hair";
        readonly keywords: readonly ["beard", "mustache", "goatee", "stubble", "facial hair"];
        readonly aliases: readonly ["facial hair", "beard", "mustache"];
        readonly description: "Facial hair style and appearance";
    };
    readonly nose_shape: {
        readonly column: "appearance";
        readonly path: "face.nose.shape";
        readonly keywords: readonly ["nose", "shape", "pointed", "button", "aquiline", "straight"];
        readonly aliases: readonly ["nose shape"];
        readonly description: "Shape and size of nose";
    };
    readonly lips: {
        readonly column: "appearance";
        readonly path: "face.lips";
        readonly keywords: readonly ["lips", "mouth", "full", "thin", "pouty", "smile"];
        readonly aliases: readonly ["lip shape", "mouth"];
        readonly description: "Lip shape and mouth appearance";
    };
    readonly skin_tone: {
        readonly column: "appearance";
        readonly path: "skin.tone";
        readonly keywords: readonly ["skin", "tone", "pale", "dark", "olive", "tan", "complexion"];
        readonly aliases: readonly ["skin tone", "complexion"];
        readonly description: "Character skin color and tone";
    };
    readonly skin_texture: {
        readonly column: "appearance";
        readonly path: "skin.texture";
        readonly keywords: readonly ["skin", "texture", "smooth", "rough", "soft", "weathered"];
        readonly aliases: readonly ["skin texture"];
        readonly description: "Texture and feel of character skin";
    };
    readonly scars: {
        readonly column: "appearance";
        readonly path: "skin.scars";
        readonly keywords: readonly ["scar", "scars", "mark", "marks", "blemish"];
        readonly aliases: readonly ["scars", "markings"];
        readonly description: "Scars and permanent marks on skin";
    };
    readonly tattoos: {
        readonly column: "appearance";
        readonly path: "skin.tattoos";
        readonly keywords: readonly ["tattoo", "tattoos", "ink", "design"];
        readonly aliases: readonly ["tattoos", "body art"];
        readonly description: "Tattoos and body art";
    };
    readonly breast_size: {
        readonly column: "appearance";
        readonly path: "body.chest.size";
        readonly keywords: readonly ["breast", "chest", "bosom", "size", "big", "small", "medium"];
        readonly aliases: readonly ["breast size", "chest size"];
        readonly description: "Size and shape of chest/breasts";
    };
    readonly breast_shape: {
        readonly column: "appearance";
        readonly path: "body.chest.shape";
        readonly keywords: readonly ["breast", "chest", "shape", "round", "perky", "full"];
        readonly aliases: readonly ["breast shape"];
        readonly description: "Shape and appearance of breasts";
    };
    readonly waist: {
        readonly column: "appearance";
        readonly path: "body.waist";
        readonly keywords: readonly ["waist", "waistline", "hips", "curves", "narrow", "wide"];
        readonly aliases: readonly ["waistline"];
        readonly description: "Waist and hip measurements";
    };
    readonly legs: {
        readonly column: "appearance";
        readonly path: "body.legs";
        readonly keywords: readonly ["legs", "thighs", "calves", "long", "short", "muscular"];
        readonly aliases: readonly ["leg shape"];
        readonly description: "Leg shape and appearance";
    };
    readonly arms: {
        readonly column: "appearance";
        readonly path: "body.arms";
        readonly keywords: readonly ["arms", "biceps", "forearms", "muscular", "slender"];
        readonly aliases: readonly ["arm shape"];
        readonly description: "Arm shape and muscle definition";
    };
    readonly feet_size: {
        readonly column: "appearance";
        readonly path: "feet.size";
        readonly keywords: readonly ["feet", "foot", "size", "big", "small", "petite", "large"];
        readonly aliases: readonly ["foot size"];
        readonly description: "Size of character feet";
    };
    readonly feet_shape: {
        readonly column: "appearance";
        readonly path: "feet.shape";
        readonly keywords: readonly ["feet", "foot", "shape", "arch", "wide", "narrow", "delicate"];
        readonly aliases: readonly ["foot shape"];
        readonly description: "Shape and structure of feet";
    };
    readonly feet_nails: {
        readonly column: "appearance";
        readonly path: "feet.nails";
        readonly keywords: readonly ["feet", "foot", "nails", "toenails", "polish", "painted"];
        readonly aliases: readonly ["toenails", "foot nails"];
        readonly description: "Toenail appearance and polish";
    };
    readonly hands: {
        readonly column: "appearance";
        readonly path: "body.hands";
        readonly keywords: readonly ["hands", "fingers", "nails", "manicure", "calluses"];
        readonly aliases: readonly ["hand shape"];
        readonly description: "Hand and finger appearance";
    };
    readonly fingernails: {
        readonly column: "appearance";
        readonly path: "body.hands.nails";
        readonly keywords: readonly ["nails", "fingernails", "manicure", "polish", "length"];
        readonly aliases: readonly ["fingernails", "nail polish"];
        readonly description: "Fingernail appearance and polish";
    };
    readonly voice_pitch: {
        readonly column: "appearance";
        readonly path: "voice.pitch";
        readonly keywords: readonly ["voice", "pitch", "high", "low", "deep", "soprano", "alto"];
        readonly aliases: readonly ["voice pitch"];
        readonly description: "Pitch and tone of speaking voice";
    };
    readonly voice_accent: {
        readonly column: "appearance";
        readonly path: "voice.accent";
        readonly keywords: readonly ["voice", "accent", "dialect", "speech", "pronunciation"];
        readonly aliases: readonly ["accent", "dialect"];
        readonly description: "Speech accent and dialect";
    };
    readonly speech_pattern: {
        readonly column: "appearance";
        readonly path: "voice.speech_pattern";
        readonly keywords: readonly ["speech", "speaking", "voice", "manner", "eloquent", "shy"];
        readonly aliases: readonly ["speech pattern", "speaking style"];
        readonly description: "How character speaks and communicates";
    };
    readonly feet_scents: {
        readonly column: "scents_aromas";
        readonly path: "feet.scents";
        readonly keywords: readonly ["feet", "foot", "smell", "scent", "odor", "aroma", "stinky", "musky"];
        readonly aliases: readonly ["feet smell", "foot odor"];
        readonly description: "Natural scent of character feet";
    };
    readonly feet_intensity: {
        readonly column: "scents_aromas";
        readonly path: "feet.intensity";
        readonly keywords: readonly ["feet", "foot", "smell", "strong", "mild", "intense", "faint"];
        readonly aliases: readonly ["feet smell intensity"];
        readonly description: "Intensity of feet scent";
    };
    readonly body_scent: {
        readonly column: "scents_aromas";
        readonly path: "body.natural";
        readonly keywords: readonly ["body", "smell", "scent", "natural", "musk", "pheromones"];
        readonly aliases: readonly ["body odor", "natural scent"];
        readonly description: "Natural body scent and pheromones";
    };
    readonly hair_scent: {
        readonly column: "scents_aromas";
        readonly path: "hair.scents";
        readonly keywords: readonly ["hair", "shampoo", "scent", "fragrance", "smell"];
        readonly aliases: readonly ["hair smell", "hair fragrance"];
        readonly description: "Scent of character hair and hair products";
    };
    readonly perfume: {
        readonly column: "scents_aromas";
        readonly path: "body.perfume";
        readonly keywords: readonly ["perfume", "cologne", "fragrance", "scent", "floral", "vanilla"];
        readonly aliases: readonly ["fragrance", "cologne"];
        readonly description: "Applied perfumes and fragrances";
    };
    readonly breath: {
        readonly column: "scents_aromas";
        readonly path: "breath";
        readonly keywords: readonly ["breath", "mouth", "mint", "fresh", "morning"];
        readonly aliases: readonly ["breath scent"];
        readonly description: "Scent of character breath";
    };
    readonly intimate_scents: {
        readonly column: "scents_aromas";
        readonly path: "intimate.scents";
        readonly keywords: readonly ["intimate", "private", "personal", "musk"];
        readonly aliases: readonly ["personal scent"];
        readonly description: "Personal intimate scents";
    };
    readonly personality_traits: {
        readonly column: "personality";
        readonly path: "traits";
        readonly keywords: readonly ["personality", "character", "shy", "outgoing", "kind", "mean", "funny"];
        readonly aliases: readonly ["personality traits", "character traits"];
        readonly description: "Core personality characteristics";
    };
    readonly temperament: {
        readonly column: "personality";
        readonly path: "temperament";
        readonly keywords: readonly ["temperament", "mood", "disposition", "nature"];
        readonly aliases: readonly ["disposition"];
        readonly description: "General temperament and disposition";
    };
    readonly emotional_state: {
        readonly column: "personality";
        readonly path: "emotional_state";
        readonly keywords: readonly ["feeling", "emotion", "mood", "happy", "sad", "angry", "excited"];
        readonly aliases: readonly ["mood", "feelings", "emotional state"];
        readonly description: "Current emotional condition";
    };
    readonly dominant_emotion: {
        readonly column: "personality";
        readonly path: "dominant_emotion";
        readonly keywords: readonly ["emotion", "feeling", "usually", "typically", "generally"];
        readonly aliases: readonly ["usual mood"];
        readonly description: "Most common emotional state";
    };
    readonly behavioral_patterns: {
        readonly column: "personality";
        readonly path: "behavioral_patterns";
        readonly keywords: readonly ["behavior", "habits", "patterns", "usual", "typically", "always"];
        readonly aliases: readonly ["behavior patterns", "habits"];
        readonly description: "Behavioral habits and patterns";
    };
    readonly quirks: {
        readonly column: "personality";
        readonly path: "quirks";
        readonly keywords: readonly ["quirk", "quirks", "habit", "peculiar", "unique", "odd"];
        readonly aliases: readonly ["quirks", "odd habits"];
        readonly description: "Unique quirks and mannerisms";
    };
    readonly fears: {
        readonly column: "personality";
        readonly path: "fears";
        readonly keywords: readonly ["fear", "fears", "afraid", "scared", "phobia", "terrified"];
        readonly aliases: readonly ["phobias", "afraid of"];
        readonly description: "Things character is afraid of";
    };
    readonly desires: {
        readonly column: "personality";
        readonly path: "desires";
        readonly keywords: readonly ["desire", "desires", "want", "wants", "wish", "dream"];
        readonly aliases: readonly ["wants", "wishes"];
        readonly description: "Character desires and wants";
    };
    readonly goals: {
        readonly column: "personality";
        readonly path: "goals";
        readonly keywords: readonly ["goal", "goals", "ambition", "dream", "aspire", "hope"];
        readonly aliases: readonly ["ambitions", "aspirations"];
        readonly description: "Character goals and ambitions";
    };
    readonly moral_alignment: {
        readonly column: "personality";
        readonly path: "morality.alignment";
        readonly keywords: readonly ["moral", "morality", "good", "evil", "neutral", "ethics"];
        readonly aliases: readonly ["moral alignment", "ethics"];
        readonly description: "Moral alignment and ethical stance";
    };
    readonly core_values: {
        readonly column: "personality";
        readonly path: "values";
        readonly keywords: readonly ["values", "beliefs", "principles", "important", "stands for"];
        readonly aliases: readonly ["beliefs", "principles"];
        readonly description: "Core values and beliefs";
    };
    readonly virtues: {
        readonly column: "personality";
        readonly path: "virtues";
        readonly keywords: readonly ["virtue", "virtues", "good", "positive", "strength"];
        readonly aliases: readonly ["positive traits", "strengths"];
        readonly description: "Character virtues and positive traits";
    };
    readonly vices: {
        readonly column: "personality";
        readonly path: "vices";
        readonly keywords: readonly ["vice", "vices", "flaw", "flaws", "weakness", "bad"];
        readonly aliases: readonly ["flaws", "weaknesses"];
        readonly description: "Character vices and negative traits";
    };
    readonly intelligence: {
        readonly column: "personality";
        readonly path: "intellect.level";
        readonly keywords: readonly ["smart", "intelligent", "clever", "wise", "brilliant", "genius"];
        readonly aliases: readonly ["intelligence level", "smarts"];
        readonly description: "Character intelligence level";
    };
    readonly education: {
        readonly column: "personality";
        readonly path: "intellect.education";
        readonly keywords: readonly ["education", "school", "university", "learning", "studied"];
        readonly aliases: readonly ["educational background"];
        readonly description: "Educational background and learning";
    };
    readonly skills: {
        readonly column: "personality";
        readonly path: "intellect.skills";
        readonly keywords: readonly ["skill", "skills", "talent", "ability", "good at"];
        readonly aliases: readonly ["talents", "abilities"];
        readonly description: "Character skills and talents";
    };
    readonly background: {
        readonly column: "background";
        readonly path: "";
        readonly keywords: readonly ["background", "history", "past", "story", "origin", "grew up"];
        readonly aliases: readonly ["personal history", "backstory"];
        readonly description: "Character background and personal history";
    };
    readonly occupation: {
        readonly column: "background";
        readonly path: "occupation";
        readonly keywords: readonly ["job", "work", "occupation", "career", "profession", "employed"];
        readonly aliases: readonly ["job", "career", "profession"];
        readonly description: "Character profession or occupation";
    };
    readonly family: {
        readonly column: "background";
        readonly path: "family";
        readonly keywords: readonly ["family", "parents", "siblings", "mother", "father", "relatives"];
        readonly aliases: readonly ["family background", "relatives"];
        readonly description: "Family background and relationships";
    };
    readonly origin: {
        readonly column: "background";
        readonly path: "origin";
        readonly keywords: readonly ["from", "origin", "birthplace", "hometown", "where", "born"];
        readonly aliases: readonly ["birthplace", "hometown"];
        readonly description: "Character origin and birthplace";
    };
    readonly wealth: {
        readonly column: "background";
        readonly path: "wealth";
        readonly keywords: readonly ["money", "rich", "poor", "wealthy", "broke", "income"];
        readonly aliases: readonly ["financial status", "money"];
        readonly description: "Character wealth and financial status";
    };
    readonly living_situation: {
        readonly column: "background";
        readonly path: "living_situation";
        readonly keywords: readonly ["live", "lives", "home", "house", "apartment", "residence"];
        readonly aliases: readonly ["home", "residence"];
        readonly description: "Where and how character lives";
    };
    readonly possessions: {
        readonly column: "background";
        readonly path: "possessions";
        readonly keywords: readonly ["owns", "has", "possession", "belongings", "stuff"];
        readonly aliases: readonly ["belongings", "owns"];
        readonly description: "Important possessions and belongings";
    };
    readonly relationships: {
        readonly column: "background";
        readonly path: "relationships";
        readonly keywords: readonly ["relationship", "relationships", "friends", "enemies", "allies"];
        readonly aliases: readonly ["social connections"];
        readonly description: "Character relationships with others";
    };
    readonly romantic_status: {
        readonly column: "background";
        readonly path: "romantic_status";
        readonly keywords: readonly ["romantic", "dating", "married", "single", "relationship", "boyfriend", "girlfriend"];
        readonly aliases: readonly ["relationship status", "dating"];
        readonly description: "Romantic relationship status";
    };
    readonly clothing_style: {
        readonly column: "appearance";
        readonly path: "clothing.style";
        readonly keywords: readonly ["clothing", "clothes", "style", "fashion", "dress", "outfit"];
        readonly aliases: readonly ["fashion style", "dress style"];
        readonly description: "Character clothing and fashion style";
    };
    readonly current_outfit: {
        readonly column: "appearance";
        readonly path: "clothing.current";
        readonly keywords: readonly ["wearing", "dressed", "outfit", "clothes", "clothing"];
        readonly aliases: readonly ["current outfit", "wearing"];
        readonly description: "Currently worn clothing and outfit";
    };
    readonly accessories: {
        readonly column: "appearance";
        readonly path: "accessories";
        readonly keywords: readonly ["accessories", "jewelry", "watch", "necklace", "earrings", "bracelet"];
        readonly aliases: readonly ["jewelry", "accessories"];
        readonly description: "Worn accessories and jewelry";
    };
    readonly special_abilities: {
        readonly column: "personality";
        readonly path: "abilities.special";
        readonly keywords: readonly ["ability", "abilities", "power", "powers", "magic", "special"];
        readonly aliases: readonly ["powers", "special abilities"];
        readonly description: "Special abilities or supernatural powers";
    };
    readonly weaknesses: {
        readonly column: "personality";
        readonly path: "weaknesses";
        readonly keywords: readonly ["weakness", "weaknesses", "vulnerable", "weak", "limitation"];
        readonly aliases: readonly ["vulnerabilities", "limitations"];
        readonly description: "Character weaknesses and vulnerabilities";
    };
    readonly species: {
        readonly column: "appearance";
        readonly path: "species";
        readonly keywords: readonly ["species", "race", "human", "elf", "dwarf", "creature", "being"];
        readonly aliases: readonly ["race", "creature type"];
        readonly description: "Character species or race";
    };
};
export declare const SCHEMA_VERSION = "1.0.0";
export declare function getPathsForColumn(column: string): string[];
export declare function getAllKeywords(): string[];
export declare function findAttributesByKeyword(keyword: string): AttributeKey[];
//# sourceMappingURL=attribute.schema.d.ts.map