#!/usr/bin/env node

/**
 * Naming Convention Checker
 * 
 * Scans for files that violate the project's naming conventions:
 * - Allows: camelCase, dot.case (e.g., file.service.ts, file.schema.ts)
 * - Rejects: kebab-case, snake_case
 * 
 * Usage: npm run check:naming
 */

const { execSync } = require('child_process');
const path = require('path');

const EXCLUDE_PATTERNS = [
  'node_modules',
  '.next',
  'dist',
  'build',
  'coverage',
  '.git'
];

function checkNamingConventions() {
  console.log('🔍 Checking naming conventions...\n');
  
  try {
    // Use find to get files with naming violations (much more accurate than grep)
    const excludeArgs = EXCLUDE_PATTERNS.map(pattern => `-path "./${pattern}" -prune -o`).join(' ');
    const command = `find . ${excludeArgs} \\( -name "*.ts" -o -name "*.tsx" \\) -print | grep -E '[a-z0-9]+([-_])[a-z0-9]+\\.(ts|tsx)$'`;
    
    const result = execSync(command, { 
      encoding: 'utf8',
      cwd: process.cwd()
    });
    
    if (result.trim()) {
      console.log('❌ Found naming convention violations:\n');
      
      // Parse and format the results
      const violations = result.trim().split('\n');
      const groupedViolations = {};
      
      violations.forEach(filePath => {
        const relativePath = path.relative(process.cwd(), filePath.trim());
        const fileName = path.basename(filePath.trim());
        
        if (!groupedViolations[fileName]) {
          groupedViolations[fileName] = [];
        }
        groupedViolations[fileName].push(relativePath);
      });
      
      Object.entries(groupedViolations).forEach(([fileName, paths]) => {
        console.log(`📁 ${fileName}`);
        paths.forEach(filePath => {
          console.log(`   ${filePath}`);
        });
        console.log();
      });
      
      console.log('💡 Naming convention guide:');
      console.log('   ✅ camelCase: myFile.ts, userActions.ts');
      console.log('   ✅ dot.case: user.service.ts, character.schema.ts, location.repository.ts');
      console.log('   ❌ kebab-case: my-file.ts, user-actions.ts');
      console.log('   ❌ snake_case: my_file.ts, user_actions.ts\n');
      
      process.exit(1);
    } else {
      console.log('✅ All files follow naming conventions!');
    }
    
  } catch (error) {
    if (error.status === 1) {
      // grep returns 1 when no matches found - this is good!
      console.log('✅ All files follow naming conventions!');
    } else {
      console.error('❌ Error checking naming conventions:', error.message);
      process.exit(1);
    }
  }
}

if (require.main === module) {
  checkNamingConventions();
}

module.exports = { checkNamingConventions };