const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const getFilesForOptions = require('./utils/utils').getFilesForOptions;
const expectedFiles = require('./utils/expected-files');
const angularFiles = require('../generators/client/files-angular').files;
const reactFiles = require('../generators/client/files-react').files;
const constants = require('../generators/generator-constants');
const { appDefaultConfig } = require('../generators/generator-defaults');
const {
    SUPPORTED_CLIENT_FRAMEWORKS: { ANGULAR, REACT, VUE },
} = require('../generators/generator-constants');

const { CLIENT_TEST_SRC_DIR } = constants;

describe('JHipster client generator', () => {
    describe('generate client with React', () => {
        before(done => {
            helpers
                .run(path.join(__dirname, '../generators/client'))
                .withOptions({ skipInstall: true, auth: 'jwt', experimental: true })
                .withPrompts({
                    baseName: 'jhipster',
                    serviceDiscoveryType: false,
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['fr'],
                    clientFramework: REACT,
                })
                .on('end', done);
        });
        it('creates expected files for react configuration for client generator', () => {
            assert.noFile(expectedFiles.maven);
            assert.file(expectedFiles.clientCommon);
            assert.file(
                getFilesForOptions(reactFiles, {
                    enableTranslation: true,
                    serviceDiscoveryType: false,
                    authenticationType: 'jwt',
                    testFrameworks: [],
                })
            );
        });
        it('contains clientFramework with react value', () => {
            assert.fileContent('.yo-rc.json', /"clientFramework": "react"/);
        });
        it('should not contain version placeholders at package.json', () => {
            assert.noFileContent('package.json', /VERSION_MANAGED_BY_CLIENT_COMMON/);
            assert.noFileContent('package.json', /VERSION_MANAGED_BY_CLIENT_ANGULAR/);
            assert.noFileContent('package.json', /VERSION_MANAGED_BY_CLIENT_REACT/);
            assert.noFileContent('package.json', /VERSION_MANAGED_BY_CLIENT_VUE/);
        });
    });

    describe('generate client with Angular', () => {
        before(done => {
            helpers
                .run(path.join(__dirname, '../generators/client'))
                .withOptions({ skipInstall: true, auth: 'jwt' })
                .withPrompts({
                    baseName: 'jhipster',
                    serviceDiscoveryType: false,
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['fr'],
                    clientFramework: ANGULAR,
                })
                .on('end', done);
        });

        it('creates expected files for default configuration for client generator', () => {
            assert.noFile(expectedFiles.server);
            assert.noFile(expectedFiles.maven);
            assert.file(expectedFiles.common);
            assert.file(expectedFiles.i18nJson);
            assert.file(expectedFiles.clientCommon);
            assert.file(
                getFilesForOptions(angularFiles, {
                    enableTranslation: true,
                    serviceDiscoveryType: false,
                    authenticationType: 'jwt',
                    testFrameworks: [],
                })
            );
        });
        it('contains clientFramework with angularX value', () => {
            assert.fileContent('.yo-rc.json', /"clientFramework": "angularX"/);
        });
        it('contains clientPackageManager with npm value', () => {
            assert.fileContent('.yo-rc.json', /"clientPackageManager": "npm"/);
        });
        it('should not contain version placeholders at package.json', () => {
            assert.noFileContent('package.json', /VERSION_MANAGED_BY_CLIENT_COMMON/);
            assert.noFileContent('package.json', /VERSION_MANAGED_BY_CLIENT_ANGULAR/);
            assert.noFileContent('package.json', /VERSION_MANAGED_BY_CLIENT_REACT/);
            assert.noFileContent('package.json', /VERSION_MANAGED_BY_CLIENT_VUE/);
        });
    });

    describe('--skip-jhipster-dependencies', () => {
        [ANGULAR, REACT, VUE].forEach(clientFramework => {
            describe(`and ${clientFramework}`, () => {
                let runResult;
                before(() => {
                    return helpers
                        .create(require.resolve('../generators/app'))
                        .withOptions({
                            fromCli: true,
                            skipInstall: true,
                            defaultLocalConfig: { ...appDefaultConfig, clientFramework, skipServer: true },
                            skipJhipsterDependencies: true,
                        })
                        .run()
                        .then(result => {
                            runResult = result;
                        });
                });

                after(() => runResult.cleanup());

                it('should add clientFramework to .yo-rc.json', () => {
                    runResult.assertFileContent('.yo-rc.json', `"clientFramework": "${clientFramework}"`);
                });
                it('should not add generator-jhipster to package.json', () => {
                    runResult.assertNoFileContent('package.json', 'generator-jhipster');
                });
            });
        });
    });

    describe('--with-admin-ui', () => {
        [ANGULAR].forEach(clientFramework => {
            describe(`selected and ${clientFramework}`, () => {
                let runResult;
                before(() => {
                    return helpers
                        .create(require.resolve('../generators/client'))
                        .withOptions({
                            fromCli: true,
                            skipInstall: true,
                            defaultLocalConfig: { ...appDefaultConfig, clientFramework, testFrameworks: ['cypress'] },
                            withAdminUi: true,
                        })
                        .run()
                        .then(result => {
                            runResult = result;
                        });
                });

                after(() => runResult.cleanup());

                it('should have admin ui components', () => {
                    runResult.assertFile(expectedFiles.clientAdmin);
                });

                it('should contains admin ui cypress tests', () => {
                    assert.fileContent(
                        `${CLIENT_TEST_SRC_DIR}cypress/integration/administration/administration.spec.ts`,
                        '  metricsPageHeadingSelector,\n' +
                            '  healthPageHeadingSelector,\n' +
                            '  logsPageHeadingSelector,\n' +
                            '  configurationPageHeadingSelector,'
                    );

                    assert.fileContent(
                        `${CLIENT_TEST_SRC_DIR}cypress/integration/administration/administration.spec.ts`,
                        "  describe('/metrics', () => {\n" +
                            "    it('should load the page', () => {\n" +
                            "      cy.clickOnAdminMenuItem('metrics');\n" +
                            "      cy.get(metricsPageHeadingSelector).should('be.visible');\n" +
                            '    });\n' +
                            '  });\n' +
                            '\n' +
                            "  describe('/health', () => {\n" +
                            "    it('should load the page', () => {\n" +
                            "      cy.clickOnAdminMenuItem('health');\n" +
                            "      cy.get(healthPageHeadingSelector).should('be.visible');\n" +
                            '    });\n' +
                            '  });\n' +
                            '\n' +
                            "  describe('/logs', () => {\n" +
                            "    it('should load the page', () => {\n" +
                            "      cy.clickOnAdminMenuItem('logs');\n" +
                            "      cy.get(logsPageHeadingSelector).should('be.visible');\n" +
                            '    });\n' +
                            '  });\n' +
                            '\n' +
                            "  describe('/configuration', () => {\n" +
                            "    it('should load the page', () => {\n" +
                            "      cy.clickOnAdminMenuItem('configuration');\n" +
                            "      cy.get(configurationPageHeadingSelector).should('be.visible');\n" +
                            '    });\n' +
                            '  });'
                    );

                    assert.fileContent(
                        `${CLIENT_TEST_SRC_DIR}cypress/support/commands.ts`,
                        'export const metricsPageHeadingSelector = \'[data-cy="metricsPageHeading"]\';\n' +
                            'export const healthPageHeadingSelector = \'[data-cy="healthPageHeading"]\';\n' +
                            'export const logsPageHeadingSelector = \'[data-cy="logsPageHeading"]\';\n' +
                            'export const configurationPageHeadingSelector = \'[data-cy="configurationPageHeading"]\';'
                    );
                });
            });

            describe(`not selected and ${clientFramework}`, () => {
                let runResult;
                before(() => {
                    return helpers
                        .create(require.resolve('../generators/client'))
                        .withOptions({
                            fromCli: true,
                            skipInstall: true,
                            defaultLocalConfig: { ...appDefaultConfig, clientFramework, testFrameworks: ['cypress'] },
                            withAdminUi: false,
                        })
                        .run()
                        .then(result => {
                            runResult = result;
                        });
                });

                after(() => runResult.cleanup());

                it('should not have admin ui components', () => {
                    runResult.assertNoFile(expectedFiles.clientAdmin);
                });

                it('should not contains admin ui cypress tests', () => {
                    assert.noFileContent(
                        `${CLIENT_TEST_SRC_DIR}cypress/integration/administration/administration.spec.ts`,
                        '  metricsPageHeadingSelector,\n' +
                            '  healthPageHeadingSelector,\n' +
                            '  logsPageHeadingSelector,\n' +
                            '  configurationPageHeadingSelector,'
                    );

                    assert.noFileContent(
                        `${CLIENT_TEST_SRC_DIR}cypress/integration/administration/administration.spec.ts`,
                        "  describe('/metrics', () => {\n" +
                            "    it('should load the page', () => {\n" +
                            "      cy.clickOnAdminMenuItem('metrics');\n" +
                            "      cy.get(metricsPageHeadingSelector).should('be.visible');\n" +
                            '    });\n' +
                            '  });\n' +
                            '\n' +
                            "  describe('/health', () => {\n" +
                            "    it('should load the page', () => {\n" +
                            "      cy.clickOnAdminMenuItem('health');\n" +
                            "      cy.get(healthPageHeadingSelector).should('be.visible');\n" +
                            '    });\n' +
                            '  });\n' +
                            '\n' +
                            "  describe('/logs', () => {\n" +
                            "    it('should load the page', () => {\n" +
                            "      cy.clickOnAdminMenuItem('logs');\n" +
                            "      cy.get(logsPageHeadingSelector).should('be.visible');\n" +
                            '    });\n' +
                            '  });\n' +
                            '\n' +
                            "  describe('/configuration', () => {\n" +
                            "    it('should load the page', () => {\n" +
                            "      cy.clickOnAdminMenuItem('configuration');\n" +
                            "      cy.get(configurationPageHeadingSelector).should('be.visible');\n" +
                            '    });\n' +
                            '  });'
                    );

                    assert.noFileContent(
                        `${CLIENT_TEST_SRC_DIR}cypress/support/commands.ts`,
                        'export const metricsPageHeadingSelector = \'[data-cy="metricsPageHeading"]\';\n' +
                            'export const healthPageHeadingSelector = \'[data-cy="healthPageHeading"]\';\n' +
                            'export const logsPageHeadingSelector = \'[data-cy="logsPageHeading"]\';\n' +
                            'export const configurationPageHeadingSelector = \'[data-cy="configurationPageHeading"]\';'
                    );
                });
            });
        });
    });
});
