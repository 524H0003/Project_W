'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">project_w documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                        <li class="link">
                            <a href="license.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>LICENSE
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AppModule-85088c084f94a6f229e3892b6d65cfcec46816daef7e829a2aaae383e85a37550e6547a445a2fbab51460bc8f1ae5ac3dc023e7e8d7d70c09e9d30ef15cf8f11"' : 'data-bs-target="#xs-controllers-links-module-AppModule-85088c084f94a6f229e3892b6d65cfcec46816daef7e829a2aaae383e85a37550e6547a445a2fbab51460bc8f1ae5ac3dc023e7e8d7d70c09e9d30ef15cf8f11"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AppModule-85088c084f94a6f229e3892b6d65cfcec46816daef7e829a2aaae383e85a37550e6547a445a2fbab51460bc8f1ae5ac3dc023e7e8d7d70c09e9d30ef15cf8f11"' :
                                            'id="xs-controllers-links-module-AppModule-85088c084f94a6f229e3892b6d65cfcec46816daef7e829a2aaae383e85a37550e6547a445a2fbab51460bc8f1ae5ac3dc023e7e8d7d70c09e9d30ef15cf8f11"' }>
                                            <li class="link">
                                                <a href="controllers/AppController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppController</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuthModule.html" data-type="entity-link" >AuthModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AuthModule-98968c7534fac0608f2b250524c068ea5ddeeea61d5519a51c499e5b67633104d432f15ffd9e429175129b114d47abe7b6b2f3b7810df8fa78b0795b084ede70"' : 'data-bs-target="#xs-injectables-links-module-AuthModule-98968c7534fac0608f2b250524c068ea5ddeeea61d5519a51c499e5b67633104d432f15ffd9e429175129b114d47abe7b6b2f3b7810df8fa78b0795b084ede70"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthModule-98968c7534fac0608f2b250524c068ea5ddeeea61d5519a51c499e5b67633104d432f15ffd9e429175129b114d47abe7b6b2f3b7810df8fa78b0795b084ede70"' :
                                        'id="xs-injectables-links-module-AuthModule-98968c7534fac0608f2b250524c068ea5ddeeea61d5519a51c499e5b67633104d432f15ffd9e429175129b114d47abe7b6b2f3b7810df8fa78b0795b084ede70"' }>
                                        <li class="link">
                                            <a href="injectables/AccessStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AccessStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/AuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/HookStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HookStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/RefreshStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RefreshStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/RoleGuard.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RoleGuard</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SignService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SignService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/DeviceModule.html" data-type="entity-link" >DeviceModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-DeviceModule-b7d6727ac7b5b6121f69b665a253237036b4bdc3f259ea2f1e932517d963e5f8383b5a8c47d929f9bc377fc013c8054f961e3bbd68d5894edecdf7e6d47e2dfd"' : 'data-bs-target="#xs-injectables-links-module-DeviceModule-b7d6727ac7b5b6121f69b665a253237036b4bdc3f259ea2f1e932517d963e5f8383b5a8c47d929f9bc377fc013c8054f961e3bbd68d5894edecdf7e6d47e2dfd"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-DeviceModule-b7d6727ac7b5b6121f69b665a253237036b4bdc3f259ea2f1e932517d963e5f8383b5a8c47d929f9bc377fc013c8054f961e3bbd68d5894edecdf7e6d47e2dfd"' :
                                        'id="xs-injectables-links-module-DeviceModule-b7d6727ac7b5b6121f69b665a253237036b4bdc3f259ea2f1e932517d963e5f8383b5a8c47d929f9bc377fc013c8054f961e3bbd68d5894edecdf7e6d47e2dfd"' }>
                                        <li class="link">
                                            <a href="injectables/DeviceService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DeviceService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/EnterpriseModule.html" data-type="entity-link" >EnterpriseModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-EnterpriseModule-c56ec472ff4eb53d467897923498909aabc43712a15173ae44d85890b176b21a061b129d33610aab0dccaef516ac25ebe1df621a14420cf7254e858f5135dce2"' : 'data-bs-target="#xs-controllers-links-module-EnterpriseModule-c56ec472ff4eb53d467897923498909aabc43712a15173ae44d85890b176b21a061b129d33610aab0dccaef516ac25ebe1df621a14420cf7254e858f5135dce2"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-EnterpriseModule-c56ec472ff4eb53d467897923498909aabc43712a15173ae44d85890b176b21a061b129d33610aab0dccaef516ac25ebe1df621a14420cf7254e858f5135dce2"' :
                                            'id="xs-controllers-links-module-EnterpriseModule-c56ec472ff4eb53d467897923498909aabc43712a15173ae44d85890b176b21a061b129d33610aab0dccaef516ac25ebe1df621a14420cf7254e858f5135dce2"' }>
                                            <li class="link">
                                                <a href="controllers/EmployeeController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EmployeeController</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/EventModule.html" data-type="entity-link" >EventModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/FileModule.html" data-type="entity-link" >FileModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-FileModule-8a4d7d6c2de4e135094c1cff0c7dd4bee256a16013f9fcb692f0b460b25d56964be1b5fdcd2d6ebbdd1fb900c2f5766f4a3e77cfbb890f6c065a123788fa918f"' : 'data-bs-target="#xs-controllers-links-module-FileModule-8a4d7d6c2de4e135094c1cff0c7dd4bee256a16013f9fcb692f0b460b25d56964be1b5fdcd2d6ebbdd1fb900c2f5766f4a3e77cfbb890f6c065a123788fa918f"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-FileModule-8a4d7d6c2de4e135094c1cff0c7dd4bee256a16013f9fcb692f0b460b25d56964be1b5fdcd2d6ebbdd1fb900c2f5766f4a3e77cfbb890f6c065a123788fa918f"' :
                                            'id="xs-controllers-links-module-FileModule-8a4d7d6c2de4e135094c1cff0c7dd4bee256a16013f9fcb692f0b460b25d56964be1b5fdcd2d6ebbdd1fb900c2f5766f4a3e77cfbb890f6c065a123788fa918f"' }>
                                            <li class="link">
                                                <a href="controllers/FileController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FileController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-FileModule-8a4d7d6c2de4e135094c1cff0c7dd4bee256a16013f9fcb692f0b460b25d56964be1b5fdcd2d6ebbdd1fb900c2f5766f4a3e77cfbb890f6c065a123788fa918f"' : 'data-bs-target="#xs-injectables-links-module-FileModule-8a4d7d6c2de4e135094c1cff0c7dd4bee256a16013f9fcb692f0b460b25d56964be1b5fdcd2d6ebbdd1fb900c2f5766f4a3e77cfbb890f6c065a123788fa918f"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-FileModule-8a4d7d6c2de4e135094c1cff0c7dd4bee256a16013f9fcb692f0b460b25d56964be1b5fdcd2d6ebbdd1fb900c2f5766f4a3e77cfbb890f6c065a123788fa918f"' :
                                        'id="xs-injectables-links-module-FileModule-8a4d7d6c2de4e135094c1cff0c7dd4bee256a16013f9fcb692f0b460b25d56964be1b5fdcd2d6ebbdd1fb900c2f5766f4a3e77cfbb890f6c065a123788fa918f"' }>
                                        <li class="link">
                                            <a href="injectables/FileService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FileService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/HookModule.html" data-type="entity-link" >HookModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-HookModule-ba3cb9a45e2fc60876a6e0197cf8888f42df4fd5f4de03990c88560d9497ea53e459a6058177179049f278266b91a57fe8b60f0947be89334925a2fe1669607a"' : 'data-bs-target="#xs-injectables-links-module-HookModule-ba3cb9a45e2fc60876a6e0197cf8888f42df4fd5f4de03990c88560d9497ea53e459a6058177179049f278266b91a57fe8b60f0947be89334925a2fe1669607a"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-HookModule-ba3cb9a45e2fc60876a6e0197cf8888f42df4fd5f4de03990c88560d9497ea53e459a6058177179049f278266b91a57fe8b60f0947be89334925a2fe1669607a"' :
                                        'id="xs-injectables-links-module-HookModule-ba3cb9a45e2fc60876a6e0197cf8888f42df4fd5f4de03990c88560d9497ea53e459a6058177179049f278266b91a57fe8b60f0947be89334925a2fe1669607a"' }>
                                        <li class="link">
                                            <a href="injectables/HookService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HookService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/MailModule.html" data-type="entity-link" >MailModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-MailModule-8f2d850b648b57c96d4b2715fef6fa30c7b8c826f183197a7da57acf7d9d34d918c9bcfc546d8c2e3d23cbe1a5e71fa866564e53fe29dd7dc8552bc93b81afdc"' : 'data-bs-target="#xs-injectables-links-module-MailModule-8f2d850b648b57c96d4b2715fef6fa30c7b8c826f183197a7da57acf7d9d34d918c9bcfc546d8c2e3d23cbe1a5e71fa866564e53fe29dd7dc8552bc93b81afdc"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-MailModule-8f2d850b648b57c96d4b2715fef6fa30c7b8c826f183197a7da57acf7d9d34d918c9bcfc546d8c2e3d23cbe1a5e71fa866564e53fe29dd7dc8552bc93b81afdc"' :
                                        'id="xs-injectables-links-module-MailModule-8f2d850b648b57c96d4b2715fef6fa30c7b8c826f183197a7da57acf7d9d34d918c9bcfc546d8c2e3d23cbe1a5e71fa866564e53fe29dd7dc8552bc93b81afdc"' }>
                                        <li class="link">
                                            <a href="injectables/MailService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MailService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/NotificationModule.html" data-type="entity-link" >NotificationModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/SessionModule.html" data-type="entity-link" >SessionModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-SessionModule-90ad6f40b3a2401117d6348c94eb42f8e42825221c137861555be05af82133c55b62f7dff3305142f5f8c6fa2ab9ff7120f7b699ab5e302c342d5ef6db8f55bc"' : 'data-bs-target="#xs-injectables-links-module-SessionModule-90ad6f40b3a2401117d6348c94eb42f8e42825221c137861555be05af82133c55b62f7dff3305142f5f8c6fa2ab9ff7120f7b699ab5e302c342d5ef6db8f55bc"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-SessionModule-90ad6f40b3a2401117d6348c94eb42f8e42825221c137861555be05af82133c55b62f7dff3305142f5f8c6fa2ab9ff7120f7b699ab5e302c342d5ef6db8f55bc"' :
                                        'id="xs-injectables-links-module-SessionModule-90ad6f40b3a2401117d6348c94eb42f8e42825221c137861555be05af82133c55b62f7dff3305142f5f8c6fa2ab9ff7120f7b699ab5e302c342d5ef6db8f55bc"' }>
                                        <li class="link">
                                            <a href="injectables/SessionService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SessionService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/TestModule.html" data-type="entity-link" >TestModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-TestModule-b1bd0cece9cf39a289c75ee4fbc13c6888e9c98b10c6c4ac79b81a445ab6526938ec0391aaf9308c4e924ce53d0551fab0fe00120a426185d26bc52bcd7e571f"' : 'data-bs-target="#xs-injectables-links-module-TestModule-b1bd0cece9cf39a289c75ee4fbc13c6888e9c98b10c6c4ac79b81a445ab6526938ec0391aaf9308c4e924ce53d0551fab0fe00120a426185d26bc52bcd7e571f"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-TestModule-b1bd0cece9cf39a289c75ee4fbc13c6888e9c98b10c6c4ac79b81a445ab6526938ec0391aaf9308c4e924ce53d0551fab0fe00120a426185d26bc52bcd7e571f"' :
                                        'id="xs-injectables-links-module-TestModule-b1bd0cece9cf39a289c75ee4fbc13c6888e9c98b10c6c4ac79b81a445ab6526938ec0391aaf9308c4e924ce53d0551fab0fe00120a426185d26bc52bcd7e571f"' }>
                                        <li class="link">
                                            <a href="injectables/SignService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SignService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UniversityModule.html" data-type="entity-link" >UniversityModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-UniversityModule-0a7e0e12329b32420850b1990fff262ac18344d9e4fc2f3bac5958908cb57ac38eca57336d97328f3f15a3c0a6705b1dccf889a669dd0ea650bd532beec8e605"' : 'data-bs-target="#xs-controllers-links-module-UniversityModule-0a7e0e12329b32420850b1990fff262ac18344d9e4fc2f3bac5958908cb57ac38eca57336d97328f3f15a3c0a6705b1dccf889a669dd0ea650bd532beec8e605"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-UniversityModule-0a7e0e12329b32420850b1990fff262ac18344d9e4fc2f3bac5958908cb57ac38eca57336d97328f3f15a3c0a6705b1dccf889a669dd0ea650bd532beec8e605"' :
                                            'id="xs-controllers-links-module-UniversityModule-0a7e0e12329b32420850b1990fff262ac18344d9e4fc2f3bac5958908cb57ac38eca57336d97328f3f15a3c0a6705b1dccf889a669dd0ea650bd532beec8e605"' }>
                                            <li class="link">
                                                <a href="controllers/StudentController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StudentController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-UniversityModule-0a7e0e12329b32420850b1990fff262ac18344d9e4fc2f3bac5958908cb57ac38eca57336d97328f3f15a3c0a6705b1dccf889a669dd0ea650bd532beec8e605"' : 'data-bs-target="#xs-injectables-links-module-UniversityModule-0a7e0e12329b32420850b1990fff262ac18344d9e4fc2f3bac5958908cb57ac38eca57336d97328f3f15a3c0a6705b1dccf889a669dd0ea650bd532beec8e605"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UniversityModule-0a7e0e12329b32420850b1990fff262ac18344d9e4fc2f3bac5958908cb57ac38eca57336d97328f3f15a3c0a6705b1dccf889a669dd0ea650bd532beec8e605"' :
                                        'id="xs-injectables-links-module-UniversityModule-0a7e0e12329b32420850b1990fff262ac18344d9e4fc2f3bac5958908cb57ac38eca57336d97328f3f15a3c0a6705b1dccf889a669dd0ea650bd532beec8e605"' }>
                                        <li class="link">
                                            <a href="injectables/StudentController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StudentController</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/StudentService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StudentService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UserModule.html" data-type="entity-link" >UserModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-UserModule-77d6d645ee82572d731131529c668e791d5d33b9ef051d62803396e6448012699a4aaf8f6bef9a07f542c81bee728e6f6f2c31d6ee03476db1d42fe28941dc73"' : 'data-bs-target="#xs-injectables-links-module-UserModule-77d6d645ee82572d731131529c668e791d5d33b9ef051d62803396e6448012699a4aaf8f6bef9a07f542c81bee728e6f6f2c31d6ee03476db1d42fe28941dc73"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UserModule-77d6d645ee82572d731131529c668e791d5d33b9ef051d62803396e6448012699a4aaf8f6bef9a07f542c81bee728e6f6f2c31d6ee03476db1d42fe28941dc73"' :
                                        'id="xs-injectables-links-module-UserModule-77d6d645ee82572d731131529c668e791d5d33b9ef051d62803396e6448012699a4aaf8f6bef9a07f542c81bee728e6f6f2c31d6ee03476db1d42fe28941dc73"' }>
                                        <li class="link">
                                            <a href="injectables/UserService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#entities-links"' :
                                'data-bs-target="#xs-entities-links"' }>
                                <span class="icon ion-ios-apps"></span>
                                <span>Entities</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="entities-links"' : 'id="xs-entities-links"' }>
                                <li class="link">
                                    <a href="entities/Device.html" data-type="entity-link" >Device</a>
                                </li>
                                <li class="link">
                                    <a href="entities/Employee.html" data-type="entity-link" >Employee</a>
                                </li>
                                <li class="link">
                                    <a href="entities/Enterprise.html" data-type="entity-link" >Enterprise</a>
                                </li>
                                <li class="link">
                                    <a href="entities/Event.html" data-type="entity-link" >Event</a>
                                </li>
                                <li class="link">
                                    <a href="entities/EventCreator.html" data-type="entity-link" >EventCreator</a>
                                </li>
                                <li class="link">
                                    <a href="entities/EventParticipator.html" data-type="entity-link" >EventParticipator</a>
                                </li>
                                <li class="link">
                                    <a href="entities/EventTag.html" data-type="entity-link" >EventTag</a>
                                </li>
                                <li class="link">
                                    <a href="entities/Faculty.html" data-type="entity-link" >Faculty</a>
                                </li>
                                <li class="link">
                                    <a href="entities/File.html" data-type="entity-link" >File</a>
                                </li>
                                <li class="link">
                                    <a href="entities/Hook.html" data-type="entity-link" >Hook</a>
                                </li>
                                <li class="link">
                                    <a href="entities/Notification.html" data-type="entity-link" >Notification</a>
                                </li>
                                <li class="link">
                                    <a href="entities/Reciever.html" data-type="entity-link" >Reciever</a>
                                </li>
                                <li class="link">
                                    <a href="entities/Session.html" data-type="entity-link" >Session</a>
                                </li>
                                <li class="link">
                                    <a href="entities/Student.html" data-type="entity-link" >Student</a>
                                </li>
                                <li class="link">
                                    <a href="entities/User.html" data-type="entity-link" >User</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/AuthController.html" data-type="entity-link" >AuthController</a>
                            </li>
                            <li class="link">
                                <a href="classes/BlackBox.html" data-type="entity-link" >BlackBox</a>
                            </li>
                            <li class="link">
                                <a href="classes/Cryption.html" data-type="entity-link" >Cryption</a>
                            </li>
                            <li class="link">
                                <a href="classes/DatabaseRequests.html" data-type="entity-link" >DatabaseRequests</a>
                            </li>
                            <li class="link">
                                <a href="classes/Enterprise.html" data-type="entity-link" >Enterprise</a>
                            </li>
                            <li class="link">
                                <a href="classes/InterfaceCasting.html" data-type="entity-link" >InterfaceCasting</a>
                            </li>
                            <li class="link">
                                <a href="classes/SensitiveInfomations.html" data-type="entity-link" >SensitiveInfomations</a>
                            </li>
                            <li class="link">
                                <a href="classes/User.html" data-type="entity-link" >User</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserRecieve.html" data-type="entity-link" >UserRecieve</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserResolver.html" data-type="entity-link" >UserResolver</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AuthMiddleware.html" data-type="entity-link" >AuthMiddleware</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#guards-links"' :
                            'data-bs-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/LocalHostStrategy.html" data-type="entity-link" >LocalHostStrategy</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/Array.html" data-type="entity-link" >Array</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Expectation.html" data-type="entity-link" >Expectation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDevice.html" data-type="entity-link" >IDevice</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IEmployee.html" data-type="entity-link" >IEmployee</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IEmployeeSignup.html" data-type="entity-link" >IEmployeeSignup</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IEnterprise.html" data-type="entity-link" >IEnterprise</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IEvent.html" data-type="entity-link" >IEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IEventCreator.html" data-type="entity-link" >IEventCreator</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IEventParticipator.html" data-type="entity-link" >IEventParticipator</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IFaculty.html" data-type="entity-link" >IFaculty</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IFile.html" data-type="entity-link" >IFile</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IHook.html" data-type="entity-link" >IHook</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ILogin.html" data-type="entity-link" >ILogin</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/INotification.html" data-type="entity-link" >INotification</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPayload.html" data-type="entity-link" >IPayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IReciever.html" data-type="entity-link" >IReciever</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IRecordTime.html" data-type="entity-link" >IRecordTime</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISession.html" data-type="entity-link" >ISession</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISignUp.html" data-type="entity-link" >ISignUp</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IStudent.html" data-type="entity-link" >IStudent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IStudentInfo.html" data-type="entity-link" >IStudentInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IStudentSignup.html" data-type="entity-link" >IStudentSignup</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ITag.html" data-type="entity-link" >ITag</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUser.html" data-type="entity-link" >IUser</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUserAuthentication.html" data-type="entity-link" >IUserAuthentication</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUserInfo.html" data-type="entity-link" >IUserInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUserRecieve.html" data-type="entity-link" >IUserRecieve</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUserSensitive.html" data-type="entity-link" >IUserSensitive</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUserStatus.html" data-type="entity-link" >IUserStatus</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUserTimeRecord.html" data-type="entity-link" >IUserTimeRecord</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Number.html" data-type="entity-link" >Number</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/String.html" data-type="entity-link" >String</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});