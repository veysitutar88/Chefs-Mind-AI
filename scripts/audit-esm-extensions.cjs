const fs = require('fs');
const path = require('path');

function auditESM_Extensions(directory) {
    let violations = [];
    const files = fs.readdirSync(directory);

    for (const file of files) {
        const filePath = path.join(directory, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (file === 'node_modules') {
                continue; // Исключаем node_modules
            }
            violations = violations.concat(auditESM_Extensions(filePath));
        } else if (file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.cjs')) {
            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.split('\n');

            lines.forEach((line, index) => {
                const relativeImportRegex = /(?:import|export)\s(?:.*\sfrom\s|)\s*(?:['"])(?:\.\.?\/)(.*)(?:['"])/g;
                let match;
                while ((match = relativeImportRegex.exec(line)) !== null) {
                    const importedPath = match[1];
                    if (!importedPath.endsWith('.js') &&
                        !importedPath.endsWith('.mjs') &&
                        !importedPath.endsWith('.cjs')) {
                        violations.push({
                            file: filePath,
                            line: index + 1,
                            code: line.trim()
                        });
                    }
                }
            });
        }
    }

    return violations;
}

const targetDirectory = process.argv[2] || 'dist';
const absolutePath = path.resolve(process.cwd(), targetDirectory);

console.log(`Auditing for ESM extension violations in: ${absolutePath}`);

const violations = auditESM_Extensions(absolutePath);

if (violations.length > 0) {
    console.error('\nESM extension violations found:');
    violations.forEach(violation => {
        console.error(`  File: ${violation.file}:${violation.line}`);
        console.error(`  Code: ${violation.code}`);
    });
    process.exit(1);
} else {
    console.log('\nNo ESM extension violations found.');
    process.exit(0);
}