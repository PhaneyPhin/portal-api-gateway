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
                    <a href="index.html" data-type="index-link">nestjs-sample documentation</a>
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
                            </li>
                            <li class="link">
                                <a href="modules/AuthModule.html" data-type="entity-link" >AuthModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AuthModule-2a882a4d8e260acc3d318c411104ec7fa3e7518a612d8727ba6b2f7af5efd144bd39b8e4061ec37a5753c36adb4a7803f1a88b0871188ad2d9b184e65ac44912"' : 'data-bs-target="#xs-controllers-links-module-AuthModule-2a882a4d8e260acc3d318c411104ec7fa3e7518a612d8727ba6b2f7af5efd144bd39b8e4061ec37a5753c36adb4a7803f1a88b0871188ad2d9b184e65ac44912"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AuthModule-2a882a4d8e260acc3d318c411104ec7fa3e7518a612d8727ba6b2f7af5efd144bd39b8e4061ec37a5753c36adb4a7803f1a88b0871188ad2d9b184e65ac44912"' :
                                            'id="xs-controllers-links-module-AuthModule-2a882a4d8e260acc3d318c411104ec7fa3e7518a612d8727ba6b2f7af5efd144bd39b8e4061ec37a5753c36adb4a7803f1a88b0871188ad2d9b184e65ac44912"' }>
                                            <li class="link">
                                                <a href="controllers/AuthController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AuthModule-2a882a4d8e260acc3d318c411104ec7fa3e7518a612d8727ba6b2f7af5efd144bd39b8e4061ec37a5753c36adb4a7803f1a88b0871188ad2d9b184e65ac44912"' : 'data-bs-target="#xs-injectables-links-module-AuthModule-2a882a4d8e260acc3d318c411104ec7fa3e7518a612d8727ba6b2f7af5efd144bd39b8e4061ec37a5753c36adb4a7803f1a88b0871188ad2d9b184e65ac44912"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthModule-2a882a4d8e260acc3d318c411104ec7fa3e7518a612d8727ba6b2f7af5efd144bd39b8e4061ec37a5753c36adb4a7803f1a88b0871188ad2d9b184e65ac44912"' :
                                        'id="xs-injectables-links-module-AuthModule-2a882a4d8e260acc3d318c411104ec7fa3e7518a612d8727ba6b2f7af5efd144bd39b8e4061ec37a5753c36adb4a7803f1a88b0871188ad2d9b184e65ac44912"' }>
                                        <li class="link">
                                            <a href="injectables/AuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/JwtStrategy.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JwtStrategy</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ServiceAccountService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ServiceAccountService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/TokenService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TokenService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UserService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/BusinessModule.html" data-type="entity-link" >BusinessModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-BusinessModule-60e6018519a956f515e86ca5cc7e9a78c2966131fa1f1af900e30368cb1d7c864d64daa358f95a38ac1a4d652b8fdbfd546a24d12d6cc55a72b194f84ae325cc"' : 'data-bs-target="#xs-controllers-links-module-BusinessModule-60e6018519a956f515e86ca5cc7e9a78c2966131fa1f1af900e30368cb1d7c864d64daa358f95a38ac1a4d652b8fdbfd546a24d12d6cc55a72b194f84ae325cc"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-BusinessModule-60e6018519a956f515e86ca5cc7e9a78c2966131fa1f1af900e30368cb1d7c864d64daa358f95a38ac1a4d652b8fdbfd546a24d12d6cc55a72b194f84ae325cc"' :
                                            'id="xs-controllers-links-module-BusinessModule-60e6018519a956f515e86ca5cc7e9a78c2966131fa1f1af900e30368cb1d7c864d64daa358f95a38ac1a4d652b8fdbfd546a24d12d6cc55a72b194f84ae325cc"' }>
                                            <li class="link">
                                                <a href="controllers/BusinessController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BusinessController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-BusinessModule-60e6018519a956f515e86ca5cc7e9a78c2966131fa1f1af900e30368cb1d7c864d64daa358f95a38ac1a4d652b8fdbfd546a24d12d6cc55a72b194f84ae325cc"' : 'data-bs-target="#xs-injectables-links-module-BusinessModule-60e6018519a956f515e86ca5cc7e9a78c2966131fa1f1af900e30368cb1d7c864d64daa358f95a38ac1a4d652b8fdbfd546a24d12d6cc55a72b194f84ae325cc"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-BusinessModule-60e6018519a956f515e86ca5cc7e9a78c2966131fa1f1af900e30368cb1d7c864d64daa358f95a38ac1a4d652b8fdbfd546a24d12d6cc55a72b194f84ae325cc"' :
                                        'id="xs-injectables-links-module-BusinessModule-60e6018519a956f515e86ca5cc7e9a78c2966131fa1f1af900e30368cb1d7c864d64daa358f95a38ac1a4d652b8fdbfd546a24d12d6cc55a72b194f84ae325cc"' }>
                                        <li class="link">
                                            <a href="injectables/ServiceAccountService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ServiceAccountService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/CommonModule.html" data-type="entity-link" >CommonModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-CommonModule-242cf8c2fbf07efbeb4d96ecd46c23cea2f470049505caaddf2b6b47a403cca7287e489b62a97b25752dad7fddeacff7315d84725af66d8a4e064b0c11b0b334"' : 'data-bs-target="#xs-controllers-links-module-CommonModule-242cf8c2fbf07efbeb4d96ecd46c23cea2f470049505caaddf2b6b47a403cca7287e489b62a97b25752dad7fddeacff7315d84725af66d8a4e064b0c11b0b334"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-CommonModule-242cf8c2fbf07efbeb4d96ecd46c23cea2f470049505caaddf2b6b47a403cca7287e489b62a97b25752dad7fddeacff7315d84725af66d8a4e064b0c11b0b334"' :
                                            'id="xs-controllers-links-module-CommonModule-242cf8c2fbf07efbeb4d96ecd46c23cea2f470049505caaddf2b6b47a403cca7287e489b62a97b25752dad7fddeacff7315d84725af66d8a4e064b0c11b0b334"' }>
                                            <li class="link">
                                                <a href="controllers/AuditLogController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuditLogController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-CommonModule-242cf8c2fbf07efbeb4d96ecd46c23cea2f470049505caaddf2b6b47a403cca7287e489b62a97b25752dad7fddeacff7315d84725af66d8a4e064b0c11b0b334"' : 'data-bs-target="#xs-injectables-links-module-CommonModule-242cf8c2fbf07efbeb4d96ecd46c23cea2f470049505caaddf2b6b47a403cca7287e489b62a97b25752dad7fddeacff7315d84725af66d8a4e064b0c11b0b334"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-CommonModule-242cf8c2fbf07efbeb4d96ecd46c23cea2f470049505caaddf2b6b47a403cca7287e489b62a97b25752dad7fddeacff7315d84725af66d8a4e064b0c11b0b334"' :
                                        'id="xs-injectables-links-module-CommonModule-242cf8c2fbf07efbeb4d96ecd46c23cea2f470049505caaddf2b6b47a403cca7287e489b62a97b25752dad7fddeacff7315d84725af66d8a4e064b0c11b0b334"' }>
                                        <li class="link">
                                            <a href="injectables/AuditLogService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuditLogService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/CustomerModule.html" data-type="entity-link" >CustomerModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-CustomerModule-6adf110412f225463a0b57f5892c0daf593a400a5e391309462e02012c6f5948beb39426650c826d214872c25d565e60aff3bc661d817e2a56b460f2b7f04bb8"' : 'data-bs-target="#xs-controllers-links-module-CustomerModule-6adf110412f225463a0b57f5892c0daf593a400a5e391309462e02012c6f5948beb39426650c826d214872c25d565e60aff3bc661d817e2a56b460f2b7f04bb8"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-CustomerModule-6adf110412f225463a0b57f5892c0daf593a400a5e391309462e02012c6f5948beb39426650c826d214872c25d565e60aff3bc661d817e2a56b460f2b7f04bb8"' :
                                            'id="xs-controllers-links-module-CustomerModule-6adf110412f225463a0b57f5892c0daf593a400a5e391309462e02012c6f5948beb39426650c826d214872c25d565e60aff3bc661d817e2a56b460f2b7f04bb8"' }>
                                            <li class="link">
                                                <a href="controllers/CustomerController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CustomerController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-CustomerModule-6adf110412f225463a0b57f5892c0daf593a400a5e391309462e02012c6f5948beb39426650c826d214872c25d565e60aff3bc661d817e2a56b460f2b7f04bb8"' : 'data-bs-target="#xs-injectables-links-module-CustomerModule-6adf110412f225463a0b57f5892c0daf593a400a5e391309462e02012c6f5948beb39426650c826d214872c25d565e60aff3bc661d817e2a56b460f2b7f04bb8"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-CustomerModule-6adf110412f225463a0b57f5892c0daf593a400a5e391309462e02012c6f5948beb39426650c826d214872c25d565e60aff3bc661d817e2a56b460f2b7f04bb8"' :
                                        'id="xs-injectables-links-module-CustomerModule-6adf110412f225463a0b57f5892c0daf593a400a5e391309462e02012c6f5948beb39426650c826d214872c25d565e60aff3bc661d817e2a56b460f2b7f04bb8"' }>
                                        <li class="link">
                                            <a href="injectables/CustomerService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CustomerService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ServiceAccountService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ServiceAccountService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/DatabaseModule.html" data-type="entity-link" >DatabaseModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/EInvoiceModule.html" data-type="entity-link" >EInvoiceModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-EInvoiceModule-f8dc469ba581ddb4cf671acc4d2b60e1dfedfc1ac611224967193da598451a2eff5a57f2fea7f3d53e67c5da826ddd901f4b054d02ccbc3144210c9b393fc003"' : 'data-bs-target="#xs-controllers-links-module-EInvoiceModule-f8dc469ba581ddb4cf671acc4d2b60e1dfedfc1ac611224967193da598451a2eff5a57f2fea7f3d53e67c5da826ddd901f4b054d02ccbc3144210c9b393fc003"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-EInvoiceModule-f8dc469ba581ddb4cf671acc4d2b60e1dfedfc1ac611224967193da598451a2eff5a57f2fea7f3d53e67c5da826ddd901f4b054d02ccbc3144210c9b393fc003"' :
                                            'id="xs-controllers-links-module-EInvoiceModule-f8dc469ba581ddb4cf671acc4d2b60e1dfedfc1ac611224967193da598451a2eff5a57f2fea7f3d53e67c5da826ddd901f4b054d02ccbc3144210c9b393fc003"' }>
                                            <li class="link">
                                                <a href="controllers/BusinessController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BusinessController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/ServiceProviderController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ServiceProviderController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/UserController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-EInvoiceModule-f8dc469ba581ddb4cf671acc4d2b60e1dfedfc1ac611224967193da598451a2eff5a57f2fea7f3d53e67c5da826ddd901f4b054d02ccbc3144210c9b393fc003"' : 'data-bs-target="#xs-injectables-links-module-EInvoiceModule-f8dc469ba581ddb4cf671acc4d2b60e1dfedfc1ac611224967193da598451a2eff5a57f2fea7f3d53e67c5da826ddd901f4b054d02ccbc3144210c9b393fc003"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-EInvoiceModule-f8dc469ba581ddb4cf671acc4d2b60e1dfedfc1ac611224967193da598451a2eff5a57f2fea7f3d53e67c5da826ddd901f4b054d02ccbc3144210c9b393fc003"' :
                                        'id="xs-injectables-links-module-EInvoiceModule-f8dc469ba581ddb4cf671acc4d2b60e1dfedfc1ac611224967193da598451a2eff5a57f2fea7f3d53e67c5da826ddd901f4b054d02ccbc3144210c9b393fc003"' }>
                                        <li class="link">
                                            <a href="injectables/AttestationService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AttestationService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/EKYBService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EKYBService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/InvoiceProcessorService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >InvoiceProcessorService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/NotificationService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NotificationService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ServiceAccountService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ServiceAccountService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UserService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ExchangeRateModule.html" data-type="entity-link" >ExchangeRateModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ExchangeRateModule-5da810c60e6bb1e041f236b656ae2187295a547a3664daaa874421540cc646adfc6bb405a6f161a44571a86930a0d7fd42eff7fb871e54f2a0f80711c25aa5c3"' : 'data-bs-target="#xs-controllers-links-module-ExchangeRateModule-5da810c60e6bb1e041f236b656ae2187295a547a3664daaa874421540cc646adfc6bb405a6f161a44571a86930a0d7fd42eff7fb871e54f2a0f80711c25aa5c3"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ExchangeRateModule-5da810c60e6bb1e041f236b656ae2187295a547a3664daaa874421540cc646adfc6bb405a6f161a44571a86930a0d7fd42eff7fb871e54f2a0f80711c25aa5c3"' :
                                            'id="xs-controllers-links-module-ExchangeRateModule-5da810c60e6bb1e041f236b656ae2187295a547a3664daaa874421540cc646adfc6bb405a6f161a44571a86930a0d7fd42eff7fb871e54f2a0f80711c25aa5c3"' }>
                                            <li class="link">
                                                <a href="controllers/ExchangeRateController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ExchangeRateController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ExchangeRateModule-5da810c60e6bb1e041f236b656ae2187295a547a3664daaa874421540cc646adfc6bb405a6f161a44571a86930a0d7fd42eff7fb871e54f2a0f80711c25aa5c3"' : 'data-bs-target="#xs-injectables-links-module-ExchangeRateModule-5da810c60e6bb1e041f236b656ae2187295a547a3664daaa874421540cc646adfc6bb405a6f161a44571a86930a0d7fd42eff7fb871e54f2a0f80711c25aa5c3"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ExchangeRateModule-5da810c60e6bb1e041f236b656ae2187295a547a3664daaa874421540cc646adfc6bb405a6f161a44571a86930a0d7fd42eff7fb871e54f2a0f80711c25aa5c3"' :
                                        'id="xs-injectables-links-module-ExchangeRateModule-5da810c60e6bb1e041f236b656ae2187295a547a3664daaa874421540cc646adfc6bb405a6f161a44571a86930a0d7fd42eff7fb871e54f2a0f80711c25aa5c3"' }>
                                        <li class="link">
                                            <a href="injectables/ExchangeRateService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ExchangeRateService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/InvoiceModule.html" data-type="entity-link" >InvoiceModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-InvoiceModule-046ae5be4003ff44b859eb961a44e8910351391ef165f80dd9691f4d7d1f1167f604c9e27a586f0da369a8f5d1349252ccf203e70998745eb0cd5076f02e9e4b"' : 'data-bs-target="#xs-controllers-links-module-InvoiceModule-046ae5be4003ff44b859eb961a44e8910351391ef165f80dd9691f4d7d1f1167f604c9e27a586f0da369a8f5d1349252ccf203e70998745eb0cd5076f02e9e4b"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-InvoiceModule-046ae5be4003ff44b859eb961a44e8910351391ef165f80dd9691f4d7d1f1167f604c9e27a586f0da369a8f5d1349252ccf203e70998745eb0cd5076f02e9e4b"' :
                                            'id="xs-controllers-links-module-InvoiceModule-046ae5be4003ff44b859eb961a44e8910351391ef165f80dd9691f4d7d1f1167f604c9e27a586f0da369a8f5d1349252ccf203e70998745eb0cd5076f02e9e4b"' }>
                                            <li class="link">
                                                <a href="controllers/InvoiceController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >InvoiceController</a>
                                            </li>
                                            <li class="link">
                                                <a href="controllers/NoteController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NoteController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-InvoiceModule-046ae5be4003ff44b859eb961a44e8910351391ef165f80dd9691f4d7d1f1167f604c9e27a586f0da369a8f5d1349252ccf203e70998745eb0cd5076f02e9e4b"' : 'data-bs-target="#xs-injectables-links-module-InvoiceModule-046ae5be4003ff44b859eb961a44e8910351391ef165f80dd9691f4d7d1f1167f604c9e27a586f0da369a8f5d1349252ccf203e70998745eb0cd5076f02e9e4b"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-InvoiceModule-046ae5be4003ff44b859eb961a44e8910351391ef165f80dd9691f4d7d1f1167f604c9e27a586f0da369a8f5d1349252ccf203e70998745eb0cd5076f02e9e4b"' :
                                        'id="xs-injectables-links-module-InvoiceModule-046ae5be4003ff44b859eb961a44e8910351391ef165f80dd9691f4d7d1f1167f604c9e27a586f0da369a8f5d1349252ccf203e70998745eb0cd5076f02e9e4b"' }>
                                        <li class="link">
                                            <a href="injectables/DocumentService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DocumentService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/HandlebarsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HandlebarsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UBLHelperService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UBLHelperService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/MinioModule.html" data-type="entity-link" >MinioModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-MinioModule-94bdf60adf6b9554c738bd66eb8952178b32ad3b3224dd3a4d15cf7afdf133a70ecc4941474fb5f8e3d0fcc021d4b7939c001d13aa2f17eba1f2ddfa44386bc4"' : 'data-bs-target="#xs-controllers-links-module-MinioModule-94bdf60adf6b9554c738bd66eb8952178b32ad3b3224dd3a4d15cf7afdf133a70ecc4941474fb5f8e3d0fcc021d4b7939c001d13aa2f17eba1f2ddfa44386bc4"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-MinioModule-94bdf60adf6b9554c738bd66eb8952178b32ad3b3224dd3a4d15cf7afdf133a70ecc4941474fb5f8e3d0fcc021d4b7939c001d13aa2f17eba1f2ddfa44386bc4"' :
                                            'id="xs-controllers-links-module-MinioModule-94bdf60adf6b9554c738bd66eb8952178b32ad3b3224dd3a4d15cf7afdf133a70ecc4941474fb5f8e3d0fcc021d4b7939c001d13aa2f17eba1f2ddfa44386bc4"' }>
                                            <li class="link">
                                                <a href="controllers/FileController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FileController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-MinioModule-94bdf60adf6b9554c738bd66eb8952178b32ad3b3224dd3a4d15cf7afdf133a70ecc4941474fb5f8e3d0fcc021d4b7939c001d13aa2f17eba1f2ddfa44386bc4"' : 'data-bs-target="#xs-injectables-links-module-MinioModule-94bdf60adf6b9554c738bd66eb8952178b32ad3b3224dd3a4d15cf7afdf133a70ecc4941474fb5f8e3d0fcc021d4b7939c001d13aa2f17eba1f2ddfa44386bc4"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-MinioModule-94bdf60adf6b9554c738bd66eb8952178b32ad3b3224dd3a4d15cf7afdf133a70ecc4941474fb5f8e3d0fcc021d4b7939c001d13aa2f17eba1f2ddfa44386bc4"' :
                                        'id="xs-injectables-links-module-MinioModule-94bdf60adf6b9554c738bd66eb8952178b32ad3b3224dd3a4d15cf7afdf133a70ecc4941474fb5f8e3d0fcc021d4b7939c001d13aa2f17eba1f2ddfa44386bc4"' }>
                                        <li class="link">
                                            <a href="injectables/MinioProvider.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MinioProvider</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/MinioService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MinioService</a>
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
                                    <a href="entities/AuditLogEntity.html" data-type="entity-link" >AuditLogEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/CustomerEntity.html" data-type="entity-link" >CustomerEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/DocumentEntity.html" data-type="entity-link" >DocumentEntity</a>
                                </li>
                                <li class="link">
                                    <a href="entities/ExchangeRateEntity.html" data-type="entity-link" >ExchangeRateEntity</a>
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
                                <a href="classes/AccessTokenExpiredException.html" data-type="entity-link" >AccessTokenExpiredException</a>
                            </li>
                            <li class="link">
                                <a href="classes/AdditionalDocumentReferenceDto.html" data-type="entity-link" >AdditionalDocumentReferenceDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/AllowanceCharge.html" data-type="entity-link" >AllowanceCharge</a>
                            </li>
                            <li class="link">
                                <a href="classes/AllowanceChargeDto.html" data-type="entity-link" >AllowanceChargeDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/AllServiceProviderResponseDto.html" data-type="entity-link" >AllServiceProviderResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/AuditLog1742568476568.html" data-type="entity-link" >AuditLog1742568476568</a>
                            </li>
                            <li class="link">
                                <a href="classes/AuthCredentialsRequestDto.html" data-type="entity-link" >AuthCredentialsRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/AuthTokenResponseDto.html" data-type="entity-link" >AuthTokenResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/BaseCrudService.html" data-type="entity-link" >BaseCrudService</a>
                            </li>
                            <li class="link">
                                <a href="classes/BaseEntity.html" data-type="entity-link" >BaseEntity</a>
                            </li>
                            <li class="link">
                                <a href="classes/BusinessResponseDto.html" data-type="entity-link" >BusinessResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/BuyerDTO.html" data-type="entity-link" >BuyerDTO</a>
                            </li>
                            <li class="link">
                                <a href="classes/ChangePasswordRequestDto.html" data-type="entity-link" >ChangePasswordRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ContactDto.html" data-type="entity-link" >ContactDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ContainsTooManySpecialCharsConstraint.html" data-type="entity-link" >ContainsTooManySpecialCharsConstraint</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateAdminSchema_1602337241496.html" data-type="entity-link" >CreateAdminSchema_1602337241496</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateBusinessRequestDto.html" data-type="entity-link" >CreateBusinessRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateCustomerRequestDto.html" data-type="entity-link" >CreateCustomerRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateInvoiceTableWithDraftSupport1742568476570.html" data-type="entity-link" >CreateInvoiceTableWithDraftSupport1742568476570</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreatePermissionRequestDto.html" data-type="entity-link" >CreatePermissionRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateRoleRequestDto.html" data-type="entity-link" >CreateRoleRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateServiceProviderRequestDto.html" data-type="entity-link" >CreateServiceProviderRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateUserRequestDto.html" data-type="entity-link" >CreateUserRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreditNoteDto.html" data-type="entity-link" >CreditNoteDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CustomerExistsException.html" data-type="entity-link" >CustomerExistsException</a>
                            </li>
                            <li class="link">
                                <a href="classes/CustomerMapper.html" data-type="entity-link" >CustomerMapper</a>
                            </li>
                            <li class="link">
                                <a href="classes/CustomerMigration1742568476568.html" data-type="entity-link" >CustomerMigration1742568476568</a>
                            </li>
                            <li class="link">
                                <a href="classes/CustomerResponseDto.html" data-type="entity-link" >CustomerResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/DebitNoteDto.html" data-type="entity-link" >DebitNoteDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/DisabledUserException.html" data-type="entity-link" >DisabledUserException</a>
                            </li>
                            <li class="link">
                                <a href="classes/DocumentResponseDto.html" data-type="entity-link" >DocumentResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/EnableUuidOssp_1597941181251.html" data-type="entity-link" >EnableUuidOssp_1597941181251</a>
                            </li>
                            <li class="link">
                                <a href="classes/ExchangeRateMigration1742568476569.html" data-type="entity-link" >ExchangeRateMigration1742568476569</a>
                            </li>
                            <li class="link">
                                <a href="classes/ExchangeRateRequestDto.html" data-type="entity-link" >ExchangeRateRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ForeignKeyConflictException.html" data-type="entity-link" >ForeignKeyConflictException</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetAuthTokenRequest.html" data-type="entity-link" >GetAuthTokenRequest</a>
                            </li>
                            <li class="link">
                                <a href="classes/HashHelper.html" data-type="entity-link" >HashHelper</a>
                            </li>
                            <li class="link">
                                <a href="classes/HttpExceptionFilter.html" data-type="entity-link" >HttpExceptionFilter</a>
                            </li>
                            <li class="link">
                                <a href="classes/InvalidCredentialsException.html" data-type="entity-link" >InvalidCredentialsException</a>
                            </li>
                            <li class="link">
                                <a href="classes/InvalidCurrentPasswordException.html" data-type="entity-link" >InvalidCurrentPasswordException</a>
                            </li>
                            <li class="link">
                                <a href="classes/InvalidTokenException.html" data-type="entity-link" >InvalidTokenException</a>
                            </li>
                            <li class="link">
                                <a href="classes/InvoiceDto.html" data-type="entity-link" >InvoiceDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/InvoiceItem.html" data-type="entity-link" >InvoiceItem</a>
                            </li>
                            <li class="link">
                                <a href="classes/InvoiceLine.html" data-type="entity-link" >InvoiceLine</a>
                            </li>
                            <li class="link">
                                <a href="classes/InvoiceLineDto.html" data-type="entity-link" >InvoiceLineDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/InvoiceLineTax.html" data-type="entity-link" >InvoiceLineTax</a>
                            </li>
                            <li class="link">
                                <a href="classes/InvoiceMailDto.html" data-type="entity-link" >InvoiceMailDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ItemDto.html" data-type="entity-link" >ItemDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/LegalMonetaryTotal.html" data-type="entity-link" >LegalMonetaryTotal</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoginResponseDto.html" data-type="entity-link" >LoginResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoginUrlResponseDto.html" data-type="entity-link" >LoginUrlResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/NotificationSettingDto.html" data-type="entity-link" >NotificationSettingDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/Pagination.html" data-type="entity-link" >Pagination</a>
                            </li>
                            <li class="link">
                                <a href="classes/PaginationResponseDto.html" data-type="entity-link" >PaginationResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/Party.html" data-type="entity-link" >Party</a>
                            </li>
                            <li class="link">
                                <a href="classes/PermissionExistsException.html" data-type="entity-link" >PermissionExistsException</a>
                            </li>
                            <li class="link">
                                <a href="classes/PermissionResponseDto.html" data-type="entity-link" >PermissionResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PrepaidPayment.html" data-type="entity-link" >PrepaidPayment</a>
                            </li>
                            <li class="link">
                                <a href="classes/PrepaidPaymentDto.html" data-type="entity-link" >PrepaidPaymentDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/RefreshTokenExpiredException.html" data-type="entity-link" >RefreshTokenExpiredException</a>
                            </li>
                            <li class="link">
                                <a href="classes/RefreshTokenRequestDto.html" data-type="entity-link" >RefreshTokenRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/RejectDocumentRequest.html" data-type="entity-link" >RejectDocumentRequest</a>
                            </li>
                            <li class="link">
                                <a href="classes/RejectRequestDto.html" data-type="entity-link" >RejectRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ResponseDto.html" data-type="entity-link" >ResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/RoleExistsException.html" data-type="entity-link" >RoleExistsException</a>
                            </li>
                            <li class="link">
                                <a href="classes/RoleResponseDto.html" data-type="entity-link" >RoleResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ServiceAccountTest.html" data-type="entity-link" >ServiceAccountTest</a>
                            </li>
                            <li class="link">
                                <a href="classes/ServiceProviderResponseDto.html" data-type="entity-link" >ServiceProviderResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SubmitDocumentRequestDto.html" data-type="entity-link" >SubmitDocumentRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SubmitInvoiceDto.html" data-type="entity-link" >SubmitInvoiceDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/TaxCategoryDto.html" data-type="entity-link" >TaxCategoryDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateBusinessRequestDto.html" data-type="entity-link" >UpdateBusinessRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateCustomerRequestDto.html" data-type="entity-link" >UpdateCustomerRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateInvoiceDto.html" data-type="entity-link" >UpdateInvoiceDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdatePermissionRequestDto.html" data-type="entity-link" >UpdatePermissionRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateRoleRequestDto.html" data-type="entity-link" >UpdateRoleRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateServiceProviderRequestDto.html" data-type="entity-link" >UpdateServiceProviderRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateUserRequestDto.html" data-type="entity-link" >UpdateUserRequestDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserExistsException.html" data-type="entity-link" >UserExistsException</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserResponseDto.html" data-type="entity-link" >UserResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ValidateCustomerDto.html" data-type="entity-link" >ValidateCustomerDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ValidateTokenRequestDto.html" data-type="entity-link" >ValidateTokenRequestDto</a>
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
                                    <a href="injectables/AuditLogInterceptor.html" data-type="entity-link" >AuditLogInterceptor</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/HttpResponseInterceptor.html" data-type="entity-link" >HttpResponseInterceptor</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JwtAuthGuard.html" data-type="entity-link" >JwtAuthGuard</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TokenService.html" data-type="entity-link" >TokenService</a>
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
                                <a href="guards/PermissionsGuard.html" data-type="entity-link" >PermissionsGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/SuperUserGuard.html" data-type="entity-link" >SuperUserGuard</a>
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
                                <a href="interfaces/AllowanceChargeTotal.html" data-type="entity-link" >AllowanceChargeTotal</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AuthAccessDto.html" data-type="entity-link" >AuthAccessDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DefaultPagination.html" data-type="entity-link" >DefaultPagination</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/JwtPayload.html" data-type="entity-link" >JwtPayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LegalMonetaryTotal.html" data-type="entity-link" >LegalMonetaryTotal</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaginationRequest.html" data-type="entity-link" >PaginationRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TaxSubtotal.html" data-type="entity-link" >TaxSubtotal</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TaxTotal.html" data-type="entity-link" >TaxTotal</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TokenDto.html" data-type="entity-link" >TokenDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ValidateTokenResponseDto.html" data-type="entity-link" >ValidateTokenResponseDto</a>
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
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});