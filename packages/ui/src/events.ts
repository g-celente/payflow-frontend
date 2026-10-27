import { useSyncExternalStore } from 'react';

// Os microfrontends não compartilham estado: conversam por eventos do navegador e pelo storage.

export const TOAST_EVENT = 'payflow:toast';
export const HIDE_VALUES_EVENT = 'payflow:hide-values';
const HIDE_VALUES_STORAGE = 'payflow.hideValues';

export type ToastTone = 'success' | 'error';

export interface ToastMessage {
  readonly id: number;
  readonly message: string;
  readonly tone: ToastTone;
}

let nextToastId = 1;

// Qualquer app chama toast(); o ToastRegion do Shell mostra.
export function toast(message: string, tone: ToastTone = 'success'): void {
  window.dispatchEvent(new CustomEvent<ToastMessage>(TOAST_EVENT, { detail: { id: nextToastId++, message, tone } }));
}

// "Ocultar valores": o olho da barra lateral vale para todas as telas, de qualquer microfrontend.
export function setHideValues(hidden: boolean): void {
  localStorage.setItem(HIDE_VALUES_STORAGE, hidden ? '1' : '0');
  window.dispatchEvent(new CustomEvent(HIDE_VALUES_EVENT));
}

function subscribeHideValues(onChange: () => void): () => void {
  window.addEventListener(HIDE_VALUES_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(HIDE_VALUES_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

export function useHideValues(): boolean {
  return useSyncExternalStore(subscribeHideValues, () => localStorage.getItem(HIDE_VALUES_STORAGE) === '1', () => false);
}

// O mfe-account avisa quando nome, e-mail ou webhook mudam; o Shell e o painel recarregam o que mostram.
export const MERCHANT_UPDATED_EVENT = 'payflow:merchant-updated';

export function notifyMerchantUpdated(): void {
  window.dispatchEvent(new CustomEvent(MERCHANT_UPDATED_EVENT));
}

export function onMerchantUpdated(listener: () => void): () => void {
  window.addEventListener(MERCHANT_UPDATED_EVENT, listener);
  return () => window.removeEventListener(MERCHANT_UPDATED_EVENT, listener);
}

// O mfe-payments avisa quando cria, estorna, cancela ou confirma um pagamento; o saldo do Shell recarrega.
export const PAYMENTS_CHANGED_EVENT = 'payflow:payments-changed';

export function notifyPaymentsChanged(): void {
  window.dispatchEvent(new CustomEvent(PAYMENTS_CHANGED_EVENT));
}

export function onPaymentsChanged(listener: () => void): () => void {
  window.addEventListener(PAYMENTS_CHANGED_EVENT, listener);
  return () => window.removeEventListener(PAYMENTS_CHANGED_EVENT, listener);
}
