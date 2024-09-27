
import * as moment from 'moment';
import { Template } from '../model/template';

export const gdprConfig: Template = {
  tag: 'gdpr',
  name: $localize`⚠️ GDPR`,
  config: {
    type: 'config',
    generated: 'Generated by jasper-ui ' + moment().toISOString(),
    description: $localize`Activates GDPR compliant banner: https://github.com/beyonk-group/gdpr-cookie-consent-banner`,
    // language=HTML
    snippet: `<script type="module" src="https://cdn.jsdelivr.net/npm/@beyonk/gdpr-cookie-consent-banner/dist/index.js"></script>`,
    // language=CSS
    css: `
      cookie-consent-banner::part(toggle),
      .cookieConsentToggle {
        width: 40px;
        height: 40px;
        position: fixed;
        will-change: transform;
        padding: 9px;
        border: 0;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        background: white;
        border-radius: 50%;
        bottom: 20px;
        right: 20px;
        transition: 200ms;
        opacity: 1;
        z-index: 99980;
      }

      cookie-consent-banner::part(toggle):hover,
      .cookieConsentToggle:hover {
        color: white;
        background: black;
      }

      cookie-consent-banner::part(wrapper),
      .cookieConsentWrapper {
        z-index: 99990;
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        background: black;
        color: white;
        padding: 20px;
        transition: 200ms;
      }

      cookie-consent-banner::part(consent),
      .cookieConsent {
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
      }

      cookie-consent-banner::part(consent--content),
      .cookieConsent__Content {
        margin-right: 40px;
      }

      cookie-consent-banner::part(consent--title),
      .cookieConsent__Title {
        margin: 0;
        font-weight: bold;
      }

      cookie-consent-banner::part(consent--description),
      .cookieConsent__Description {
        margin: 10px 0 0;
      }

      cookie-consent-banner::part(consent--description-link),
      .cookieConsent__Description a {
        color: white;
        text-decoration: underline;
      }

      cookie-consent-banner::part(consent--description-link):hover,
      .cookieConsent__Description a:hover {
        text-decoration: none;
      }

      cookie-consent-banner::part(consent--right),
      .cookieConsent__Right {
        display: flex;
        align-items: flex-end;
      }

      cookie-consent-banner::part(operations),
      .cookieConsentOperations {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        transition: 300ms;
        will-change: transform;
        z-index: 99999;
      }

      cookie-consent-banner::part(operations--list),
      .cookieConsentOperations .cookieConsentOperations__List {
        transform: scale(1);
      }

      cookie-consent-banner::part(operations--list),
      .cookieConsentOperations__List {
        background: white;
        color: black;
        max-width: 500px;
        padding: 40px;
        margin: auto;
        overflow-y: auto;
        box-sizing: border-box;
        max-height: 100vh;
        transition: 200ms transform;
        will-change: transform;
        transform: scale(0.95);
      }

      cookie-consent-banner::part(operations--list-item),
      .cookieConsentOperations__Item {
        display: block;
        padding-left: 60px;
        margin-bottom: 20px;
      }

      cookie-consent-banner::part(operations--list-item--disabled),
      .cookieConsentOperations__Item.disabled {
        color: #999;
      }

      cookie-consent-banner::part(operations--list-item--disabled) cookie-consent-banner::part(operations--list-item-label)::after,
      .cookieConsentOperations__Item.disabled label::after {
        opacity: 0.3;
      }

      cookie-consent-banner::part(operations--list-item-input),
      .cookieConsentOperations__Item input {
        display: none;
      }

      cookie-consent-banner::part(operations--list-item-label),
      .cookieConsentOperations__Item label {
        align-items: center;
        font-size: 22px;
        font-weight: bold;
        display: block;
        position: relative;
      }

      cookie-consent-banner::part(operations--list-item-label)::before,
      .cookieConsentOperations__Item label::before {
        content: "";
        display: block;
        left: -60px;
        background: #DEDEDE;
        height: 20px;
        border-radius: 20px;
        width: 40px;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
      }

      cookie-consent-banner::part(operations--list-item-label)::after,
      .cookieConsentOperations__Item label::after {
        content: "";
        display: block;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: black;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        left: -58px;
        transition: 200ms;
      }

      cookie-consent-banner::part(operations--list-item-label--checked)::after,
      .cookieConsentOperations__Item input:checked+label::after {
        transform: translate(20px, -50%);
      }

      cookie-consent-banner::part(button),
      .cookieConsent__Button {
        padding: 15px 40px;
        display: block;
        background: white;
        color: black;
        white-space: nowrap;
        border: 0;
        font-size: 16px;
        margin-left: 10px;
        cursor: pointer;
        transition: 200ms;
      }

      cookie-consent-banner::part(button--close),
      .cookieConsent__Button--Close {
        background: black;
        color: white;
        margin: 40px 0 0 60px;
        padding: 15px 60px;
      }

      cookie-consent-banner::part(button):hover,
      .cookieConsent__Button:hover {
        opacity: 0.6;
      }

      @media only screen and (max-width: 900px) {
        cookie-consent-banner::part(consent),
        .cookieConsent {
          display: block;
        }

        cookie-consent-banner::part(consent--right),
        .cookieConsent__Right {
          margin-top: 20px;
        }

        cookie-consent-banner::part(button),
        .cookieConsent__Button {
          margin: 0 10px 10px 0;
        }

        cookie-consent-banner::part(button--close),
        .cookieConsent__Button--Close {
          margin: 40px 0 0;
        }
      }
    `,
    // language=HTML
    banner: `
      <cookie-consent-banner cookie-name="cookie-consent" show-edit-icon="false" />
      <script>
        window.addEventListener('consent:analytics', a => {
          // Start your tracking code here
        });
      </script>`,
  },
};
