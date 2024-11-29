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
                                            'data-bs-target="#controllers-links-module-AppModule-6cb056fb318bbf3e240c0a40f43aecd618ff8ed8baa4a76d92dcf1ce03d207c98b47ad57fe8dfc548d6893b2b287d2ec8f9585f7e82d0b460c32911efb606c81"' : 'data-bs-target="#xs-controllers-links-module-AppModule-6cb056fb318bbf3e240c0a40f43aecd618ff8ed8baa4a76d92dcf1ce03d207c98b47ad57fe8dfc548d6893b2b287d2ec8f9585f7e82d0b460c32911efb606c81"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AppModule-6cb056fb318bbf3e240c0a40f43aecd618ff8ed8baa4a76d92dcf1ce03d207c98b47ad57fe8dfc548d6893b2b287d2ec8f9585f7e82d0b460c32911efb606c81"' :
                                            'id="xs-controllers-links-module-AppModule-6cb056fb318bbf3e240c0a40f43aecd618ff8ed8baa4a76d92dcf1ce03d207c98b47ad57fe8dfc548d6893b2b287d2ec8f9585f7e82d0b460c32911efb606c81"' }>
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
                                        'data-bs-target="#injectables-links-module-AuthModule-c86c4153cc0fce00df07b7c4c44f75a0319badfbf6eb83f72b1403e4f0ae8f737df2e80fe1a43551e37e21d11fa038cae3ed92e2f106793de53d2b5fa0399ce7"' : 'data-bs-target="#xs-injectables-links-module-AuthModule-c86c4153cc0fce00df07b7c4c44f75a0319badfbf6eb83f72b1403e4f0ae8f737df2e80fe1a43551e37e21d11fa038cae3ed92e2f106793de53d2b5fa0399ce7"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthModule-c86c4153cc0fce00df07b7c4c44f75a0319badfbf6eb83f72b1403e4f0ae8f737df2e80fe1a43551e37e21d11fa038cae3ed92e2f106793de53d2b5fa0399ce7"' :
                                        'id="xs-injectables-links-module-AuthModule-c86c4153cc0fce00df07b7c4c44f75a0319badfbf6eb83f72b1403e4f0ae8f737df2e80fe1a43551e37e21d11fa038cae3ed92e2f106793de53d2b5fa0399ce7"' }>
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
                                        'data-bs-target="#injectables-links-module-DeviceModule-9b72da312cb739b1082d2ba3170825f7f46609cfe1340ab2086751a369ace2c1881ee0ccfedc9a77d921d7112a8e4838c735d7ce43fa744e40e189457b90ca27"' : 'data-bs-target="#xs-injectables-links-module-DeviceModule-9b72da312cb739b1082d2ba3170825f7f46609cfe1340ab2086751a369ace2c1881ee0ccfedc9a77d921d7112a8e4838c735d7ce43fa744e40e189457b90ca27"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-DeviceModule-9b72da312cb739b1082d2ba3170825f7f46609cfe1340ab2086751a369ace2c1881ee0ccfedc9a77d921d7112a8e4838c735d7ce43fa744e40e189457b90ca27"' :
                                        'id="xs-injectables-links-module-DeviceModule-9b72da312cb739b1082d2ba3170825f7f46609cfe1340ab2086751a369ace2c1881ee0ccfedc9a77d921d7112a8e4838c735d7ce43fa744e40e189457b90ca27"' }>
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
                                            'data-bs-target="#controllers-links-module-EnterpriseModule-671d751b68f5c027b913e6c0bb615606ec2bf23aaec78c54e96bcea102d9b5664ad7a9d6dfc35b90dcc594e7f9cdf107ce1de6cb1b021c1a07f27978162ce755"' : 'data-bs-target="#xs-controllers-links-module-EnterpriseModule-671d751b68f5c027b913e6c0bb615606ec2bf23aaec78c54e96bcea102d9b5664ad7a9d6dfc35b90dcc594e7f9cdf107ce1de6cb1b021c1a07f27978162ce755"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-EnterpriseModule-671d751b68f5c027b913e6c0bb615606ec2bf23aaec78c54e96bcea102d9b5664ad7a9d6dfc35b90dcc594e7f9cdf107ce1de6cb1b021c1a07f27978162ce755"' :
                                            'id="xs-controllers-links-module-EnterpriseModule-671d751b68f5c027b913e6c0bb615606ec2bf23aaec78c54e96bcea102d9b5664ad7a9d6dfc35b90dcc594e7f9cdf107ce1de6cb1b021c1a07f27978162ce755"' }>
                                            <li class="link">
                                                <a href="controllers/EmployeeController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EmployeeController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/EnterpriseController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EnterpriseController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-EnterpriseModule-671d751b68f5c027b913e6c0bb615606ec2bf23aaec78c54e96bcea102d9b5664ad7a9d6dfc35b90dcc594e7f9cdf107ce1de6cb1b021c1a07f27978162ce755"' : 'data-bs-target="#xs-injectables-links-module-EnterpriseModule-671d751b68f5c027b913e6c0bb615606ec2bf23aaec78c54e96bcea102d9b5664ad7a9d6dfc35b90dcc594e7f9cdf107ce1de6cb1b021c1a07f27978162ce755"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-EnterpriseModule-671d751b68f5c027b913e6c0bb615606ec2bf23aaec78c54e96bcea102d9b5664ad7a9d6dfc35b90dcc594e7f9cdf107ce1de6cb1b021c1a07f27978162ce755"' :
                                        'id="xs-injectables-links-module-EnterpriseModule-671d751b68f5c027b913e6c0bb615606ec2bf23aaec78c54e96bcea102d9b5664ad7a9d6dfc35b90dcc594e7f9cdf107ce1de6cb1b021c1a07f27978162ce755"' }>
                                        <li class="link">
                                            <a href="injectables/EmployeeService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EmployeeService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/EnterpriseService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EnterpriseService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/EventModule.html" data-type="entity-link" >EventModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-EventModule-7f6f56c14a5318ef091a57004492b8df670a9347b4ad758dfd8d4a90874a73e2bf4b60af51f832d0302a8089e20cfc9165f6ad1832e9023f58079b5938fcb29c"' : 'data-bs-target="#xs-controllers-links-module-EventModule-7f6f56c14a5318ef091a57004492b8df670a9347b4ad758dfd8d4a90874a73e2bf4b60af51f832d0302a8089e20cfc9165f6ad1832e9023f58079b5938fcb29c"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-EventModule-7f6f56c14a5318ef091a57004492b8df670a9347b4ad758dfd8d4a90874a73e2bf4b60af51f832d0302a8089e20cfc9165f6ad1832e9023f58079b5938fcb29c"' :
                                            'id="xs-controllers-links-module-EventModule-7f6f56c14a5318ef091a57004492b8df670a9347b4ad758dfd8d4a90874a73e2bf4b60af51f832d0302a8089e20cfc9165f6ad1832e9023f58079b5938fcb29c"' }>
                                            <li class="link">
                                                <a href="controllers/EventController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EventController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-EventModule-7f6f56c14a5318ef091a57004492b8df670a9347b4ad758dfd8d4a90874a73e2bf4b60af51f832d0302a8089e20cfc9165f6ad1832e9023f58079b5938fcb29c"' : 'data-bs-target="#xs-injectables-links-module-EventModule-7f6f56c14a5318ef091a57004492b8df670a9347b4ad758dfd8d4a90874a73e2bf4b60af51f832d0302a8089e20cfc9165f6ad1832e9023f58079b5938fcb29c"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-EventModule-7f6f56c14a5318ef091a57004492b8df670a9347b4ad758dfd8d4a90874a73e2bf4b60af51f832d0302a8089e20cfc9165f6ad1832e9023f58079b5938fcb29c"' :
                                        'id="xs-injectables-links-module-EventModule-7f6f56c14a5318ef091a57004492b8df670a9347b4ad758dfd8d4a90874a73e2bf4b60af51f832d0302a8089e20cfc9165f6ad1832e9023f58079b5938fcb29c"' }>
                                        <li class="link">
                                            <a href="injectables/EventCreatorService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EventCreatorService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/EventService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EventService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/EventTagService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EventTagService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/FileModule.html" data-type="entity-link" >FileModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-FileModule-6a56c6824993e97918da6c44bd31300d2f71ef5b576240c737b29b32533a931b109f678885fffc31a55484cca3ea5ee2499b1a02ecb9393c8a5df86b743aa20b"' : 'data-bs-target="#xs-controllers-links-module-FileModule-6a56c6824993e97918da6c44bd31300d2f71ef5b576240c737b29b32533a931b109f678885fffc31a55484cca3ea5ee2499b1a02ecb9393c8a5df86b743aa20b"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-FileModule-6a56c6824993e97918da6c44bd31300d2f71ef5b576240c737b29b32533a931b109f678885fffc31a55484cca3ea5ee2499b1a02ecb9393c8a5df86b743aa20b"' :
                                            'id="xs-controllers-links-module-FileModule-6a56c6824993e97918da6c44bd31300d2f71ef5b576240c737b29b32533a931b109f678885fffc31a55484cca3ea5ee2499b1a02ecb9393c8a5df86b743aa20b"' }>
                                            <li class="link">
                                                <a href="controllers/FileController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FileController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-FileModule-6a56c6824993e97918da6c44bd31300d2f71ef5b576240c737b29b32533a931b109f678885fffc31a55484cca3ea5ee2499b1a02ecb9393c8a5df86b743aa20b"' : 'data-bs-target="#xs-injectables-links-module-FileModule-6a56c6824993e97918da6c44bd31300d2f71ef5b576240c737b29b32533a931b109f678885fffc31a55484cca3ea5ee2499b1a02ecb9393c8a5df86b743aa20b"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-FileModule-6a56c6824993e97918da6c44bd31300d2f71ef5b576240c737b29b32533a931b109f678885fffc31a55484cca3ea5ee2499b1a02ecb9393c8a5df86b743aa20b"' :
                                        'id="xs-injectables-links-module-FileModule-6a56c6824993e97918da6c44bd31300d2f71ef5b576240c737b29b32533a931b109f678885fffc31a55484cca3ea5ee2499b1a02ecb9393c8a5df86b743aa20b"' }>
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
                                        'data-bs-target="#injectables-links-module-HookModule-c1f2f0231eedca0f1194841a39c9babbd8c2829431cf22ab06344b770e0097ba946d245bec4a005315c8dc605004d54fc6246572511dff7378174ef1a2856019"' : 'data-bs-target="#xs-injectables-links-module-HookModule-c1f2f0231eedca0f1194841a39c9babbd8c2829431cf22ab06344b770e0097ba946d245bec4a005315c8dc605004d54fc6246572511dff7378174ef1a2856019"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-HookModule-c1f2f0231eedca0f1194841a39c9babbd8c2829431cf22ab06344b770e0097ba946d245bec4a005315c8dc605004d54fc6246572511dff7378174ef1a2856019"' :
                                        'id="xs-injectables-links-module-HookModule-c1f2f0231eedca0f1194841a39c9babbd8c2829431cf22ab06344b770e0097ba946d245bec4a005315c8dc605004d54fc6246572511dff7378174ef1a2856019"' }>
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
                                        'data-bs-target="#injectables-links-module-MailModule-3de52d749b2b3d3cead0d1880b2be19dcdec87ea87573fc7120cfac0c4b58d691b8f0b7d0458c56b0540dbba288d7a129d34e7fb758367caaf23b3c8217e19d1"' : 'data-bs-target="#xs-injectables-links-module-MailModule-3de52d749b2b3d3cead0d1880b2be19dcdec87ea87573fc7120cfac0c4b58d691b8f0b7d0458c56b0540dbba288d7a129d34e7fb758367caaf23b3c8217e19d1"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-MailModule-3de52d749b2b3d3cead0d1880b2be19dcdec87ea87573fc7120cfac0c4b58d691b8f0b7d0458c56b0540dbba288d7a129d34e7fb758367caaf23b3c8217e19d1"' :
                                        'id="xs-injectables-links-module-MailModule-3de52d749b2b3d3cead0d1880b2be19dcdec87ea87573fc7120cfac0c4b58d691b8f0b7d0458c56b0540dbba288d7a129d34e7fb758367caaf23b3c8217e19d1"' }>
                                        <li class="link">
                                            <a href="injectables/MailService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MailService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/MainModule.html" data-type="entity-link" >MainModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/NotificationModule.html" data-type="entity-link" >NotificationModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/SessionModule.html" data-type="entity-link" >SessionModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-SessionModule-9a592427a82c1666eed7460a605ed98aa0ec3d79150c930e67dbee803ed47658363d5e7a256f069bb894ce348cad32d994a80b3920628f01f74666b50b062cf3"' : 'data-bs-target="#xs-injectables-links-module-SessionModule-9a592427a82c1666eed7460a605ed98aa0ec3d79150c930e67dbee803ed47658363d5e7a256f069bb894ce348cad32d994a80b3920628f01f74666b50b062cf3"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-SessionModule-9a592427a82c1666eed7460a605ed98aa0ec3d79150c930e67dbee803ed47658363d5e7a256f069bb894ce348cad32d994a80b3920628f01f74666b50b062cf3"' :
                                        'id="xs-injectables-links-module-SessionModule-9a592427a82c1666eed7460a605ed98aa0ec3d79150c930e67dbee803ed47658363d5e7a256f069bb894ce348cad32d994a80b3920628f01f74666b50b062cf3"' }>
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
                                        'data-bs-target="#injectables-links-module-TestModule-e318d406ec6ab27d3f1adcacf214de691fa1a42fdcfbf2b735dfa68b3aabf93a3277e41ad723f773f64bddebbd50c21ce550a33908b4369590b894de68271b38"' : 'data-bs-target="#xs-injectables-links-module-TestModule-e318d406ec6ab27d3f1adcacf214de691fa1a42fdcfbf2b735dfa68b3aabf93a3277e41ad723f773f64bddebbd50c21ce550a33908b4369590b894de68271b38"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-TestModule-e318d406ec6ab27d3f1adcacf214de691fa1a42fdcfbf2b735dfa68b3aabf93a3277e41ad723f773f64bddebbd50c21ce550a33908b4369590b894de68271b38"' :
                                        'id="xs-injectables-links-module-TestModule-e318d406ec6ab27d3f1adcacf214de691fa1a42fdcfbf2b735dfa68b3aabf93a3277e41ad723f773f64bddebbd50c21ce550a33908b4369590b894de68271b38"' }>
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
                                            'data-bs-target="#controllers-links-module-UniversityModule-f3f1fa62c76e581e0bfbcbcc1529c4c8cbd64379cc5accfc3648aae5fde0a4b759a1850f5feba4a0a1e6149323fe4b6452d04393d794066437f75e06117d532d"' : 'data-bs-target="#xs-controllers-links-module-UniversityModule-f3f1fa62c76e581e0bfbcbcc1529c4c8cbd64379cc5accfc3648aae5fde0a4b759a1850f5feba4a0a1e6149323fe4b6452d04393d794066437f75e06117d532d"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-UniversityModule-f3f1fa62c76e581e0bfbcbcc1529c4c8cbd64379cc5accfc3648aae5fde0a4b759a1850f5feba4a0a1e6149323fe4b6452d04393d794066437f75e06117d532d"' :
                                            'id="xs-controllers-links-module-UniversityModule-f3f1fa62c76e581e0bfbcbcc1529c4c8cbd64379cc5accfc3648aae5fde0a4b759a1850f5feba4a0a1e6149323fe4b6452d04393d794066437f75e06117d532d"' }>
                                            <li class="link">
                                                <a href="controllers/FacultyController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FacultyController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/StudentController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StudentController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-UniversityModule-f3f1fa62c76e581e0bfbcbcc1529c4c8cbd64379cc5accfc3648aae5fde0a4b759a1850f5feba4a0a1e6149323fe4b6452d04393d794066437f75e06117d532d"' : 'data-bs-target="#xs-injectables-links-module-UniversityModule-f3f1fa62c76e581e0bfbcbcc1529c4c8cbd64379cc5accfc3648aae5fde0a4b759a1850f5feba4a0a1e6149323fe4b6452d04393d794066437f75e06117d532d"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UniversityModule-f3f1fa62c76e581e0bfbcbcc1529c4c8cbd64379cc5accfc3648aae5fde0a4b759a1850f5feba4a0a1e6149323fe4b6452d04393d794066437f75e06117d532d"' :
                                        'id="xs-injectables-links-module-UniversityModule-f3f1fa62c76e581e0bfbcbcc1529c4c8cbd64379cc5accfc3648aae5fde0a4b759a1850f5feba4a0a1e6149323fe4b6452d04393d794066437f75e06117d532d"' }>
                                        <li class="link">
                                            <a href="injectables/FacultyService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FacultyService</a>
                                        </li>
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
                                        'data-bs-target="#injectables-links-module-UserModule-0c4c5d9c1cf6852d51c75f7fd0e272de0e54e09cdf782d03ef528e6d7818e8c0ad19c9384b3e4cbdf789179ef90325eea04ad22d046275e8b43e4b14d5c43474"' : 'data-bs-target="#xs-injectables-links-module-UserModule-0c4c5d9c1cf6852d51c75f7fd0e272de0e54e09cdf782d03ef528e6d7818e8c0ad19c9384b3e4cbdf789179ef90325eea04ad22d046275e8b43e4b14d5c43474"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UserModule-0c4c5d9c1cf6852d51c75f7fd0e272de0e54e09cdf782d03ef528e6d7818e8c0ad19c9384b3e4cbdf789179ef90325eea04ad22d046275e8b43e4b14d5c43474"' :
                                        'id="xs-injectables-links-module-UserModule-0c4c5d9c1cf6852d51c75f7fd0e272de0e54e09cdf782d03ef528e6d7818e8c0ad19c9384b3e4cbdf789179ef90325eea04ad22d046275e8b43e4b14d5c43474"' }>
                                        <li class="link">
                                            <a href="injectables/UserService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#controllers-links"' :
                                'data-bs-target="#xs-controllers-links"' }>
                                <span class="icon ion-md-swap"></span>
                                <span>Controllers</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="controllers-links"' : 'id="xs-controllers-links"' }>
                                <li class="link">
                                    <a href="controllers/AppController.html" data-type="entity-link" >AppController</a>
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
                                    <a href="entities/BaseUser.html" data-type="entity-link" >BaseUser</a>
                                </li>
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
                                <a href="classes/BaseController.html" data-type="entity-link" >BaseController</a>
                            </li>
                            <li class="link">
                                <a href="classes/BaseUserService.html" data-type="entity-link" >BaseUserService</a>
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
                                <a href="interfaces/IAuthSignUpOption.html" data-type="entity-link" >IAuthSignUpOption</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IBaseUserEmail.html" data-type="entity-link" >IBaseUserEmail</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IBaseUserEntity.html" data-type="entity-link" >IBaseUserEntity</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IBaseUserInfo.html" data-type="entity-link" >IBaseUserInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IBaseUserRelationships.html" data-type="entity-link" >IBaseUserRelationships</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDeviceEntity.html" data-type="entity-link" >IDeviceEntity</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDeviceInfo.html" data-type="entity-link" >IDeviceInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDeviceRelationship.html" data-type="entity-link" >IDeviceRelationship</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IEmployeeHook.html" data-type="entity-link" >IEmployeeHook</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IEmployeeInfo.html" data-type="entity-link" >IEmployeeInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IEmployeeSignup.html" data-type="entity-link" >IEmployeeSignup</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IEnterprise.html" data-type="entity-link" >IEnterprise</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IEnterpriseAssign.html" data-type="entity-link" >IEnterpriseAssign</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IEnterpriseInfo.html" data-type="entity-link" >IEnterpriseInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IEntityId.html" data-type="entity-link" >IEntityId</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IEventCreatorEntity.html" data-type="entity-link" >IEventCreatorEntity</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IEventCreatorRelationship.html" data-type="entity-link" >IEventCreatorRelationship</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IEventEntity.html" data-type="entity-link" >IEventEntity</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IEventInfo.html" data-type="entity-link" >IEventInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IEventParticipator.html" data-type="entity-link" >IEventParticipator</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IEventRelationships.html" data-type="entity-link" >IEventRelationships</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IFacultyAssign.html" data-type="entity-link" >IFacultyAssign</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IFacultyInfo.html" data-type="entity-link" >IFacultyInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IFile.html" data-type="entity-link" >IFile</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IHook.html" data-type="entity-link" >IHook</a>
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
                                <a href="interfaces/IRefreshResult.html" data-type="entity-link" >IRefreshResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISession.html" data-type="entity-link" >ISession</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IStudentEntity.html" data-type="entity-link" >IStudentEntity</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IStudentInfo.html" data-type="entity-link" >IStudentInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IStudentSignup.html" data-type="entity-link" >IStudentSignup</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISutdentRelationship.html" data-type="entity-link" >ISutdentRelationship</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ITagEntity.html" data-type="entity-link" >ITagEntity</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ITagInfo.html" data-type="entity-link" >ITagInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ITagRelationships.html" data-type="entity-link" >ITagRelationships</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUserAuthentication.html" data-type="entity-link" >IUserAuthentication</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUserEntity.html" data-type="entity-link" >IUserEntity</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUserInfo.html" data-type="entity-link" >IUserInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUserLogin.html" data-type="entity-link" >IUserLogin</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUserRecieve.html" data-type="entity-link" >IUserRecieve</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUserSensitive.html" data-type="entity-link" >IUserSensitive</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUserSignUp.html" data-type="entity-link" >IUserSignUp</a>
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
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
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