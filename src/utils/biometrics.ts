import { logger } from './logger.ts';

const BIOMETRIC_CREDENTIAL_KEY = 'hourly_beep_bio_cred_id';

class BiometricAuthService {
  /**
   * Check if hardware biometric platform authenticator is available.
   */
  public async isBiometricAvailable(): Promise<boolean> {
    if (typeof window === 'undefined' || !window.PublicKeyCredential) {
      return false;
    }

    try {
      if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
        return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Register biometric credential (e.g. Touch ID, Face ID, Android Biometrics, Windows Hello).
   */
  public async registerBiometrics(userName: string = 'App Owner'): Promise<boolean> {
    if (!window.PublicKeyCredential) {
      throw new Error('Biometric credentials are not supported on this device/browser.');
    }

    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const userId = new Uint8Array(16);
    crypto.getRandomValues(userId);

    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'Hourly Beep Security',
        id: window.location.hostname || 'localhost',
      },
      user: {
        id: userId,
        name: userName,
        displayName: 'Hourly Beep User',
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },  // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        requireResidentKey: false,
      },
      timeout: 60000,
      attestation: 'none',
    };

    try {
      const credential = (await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      })) as PublicKeyCredential;

      if (credential) {
        localStorage.setItem(BIOMETRIC_CREDENTIAL_KEY, credential.id);
        logger.log('INFO', 'Security', 'Biometric credential registered successfully.');
        return true;
      }
      return false;
    } catch (err: unknown) {
      logger.log('WARN', 'Security', 'Biometric registration failed or cancelled', { error: String(err) });
      throw err;
    }
  }

  /**
   * Authenticate using platform biometrics.
   */
  public async authenticateBiometrics(): Promise<boolean> {
    if (!window.PublicKeyCredential) {
      return false;
    }

    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const credentialId = localStorage.getItem(BIOMETRIC_CREDENTIAL_KEY);
    const allowCredentials: PublicKeyCredentialDescriptor[] = credentialId
      ? [
          {
            id: Uint8Array.from(atob(credentialId), (c) => c.charCodeAt(0)),
            type: 'public-key',
          },
        ]
      : [];

    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      timeout: 60000,
      userVerification: 'required',
      rpId: window.location.hostname || 'localhost',
      ...(allowCredentials.length > 0 ? { allowCredentials } : {}),
    };

    try {
      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      });

      if (assertion) {
        logger.log('INFO', 'Security', 'Biometric authentication succeeded.');
        return true;
      }
      return false;
    } catch (err) {
      logger.log('WARN', 'Security', 'Biometric authentication failed or cancelled', { error: String(err) });
      return false;
    }
  }
}

export const biometricAuth = new BiometricAuthService();
