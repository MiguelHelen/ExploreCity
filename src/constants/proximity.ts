/**
 * Configurações das notificações de proximidade.
 * Para mudar o comportamento do app, basta alterar os valores daqui.
 */

// Raios que o usuário pode escolher na aba Guia, em metros.
export const RADIUS_OPTIONS = [100, 200, 500, 1000] as const;

// Raio usado na primeira vez que o app abre.
export const DEFAULT_RADIUS_METERS = 200;

// Tempo mínimo antes de o mesmo lugar notificar de novo (6 horas).
export const NOTIFICATION_COOLDOWN_MS = 6 * 60 * 60 * 1000;