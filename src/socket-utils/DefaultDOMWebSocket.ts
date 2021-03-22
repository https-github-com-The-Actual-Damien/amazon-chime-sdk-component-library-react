// Copyright 2019-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import DOMWebSocket from './DOMWebSocket';

export default class DefaultDOMWebSocket implements DOMWebSocket {
  constructor(private webSocket: WebSocket) {}

  get url(): string {
    return this.webSocket.url;
  }

  get onopen(): EventListener | null{
    return this.webSocket.onopen;
  }

  set onopen(listener: EventListener | null) {
    this.webSocket.onopen = listener;
  }

  get onerror(): EventListener | null {
    return this.webSocket.onerror;
  }

  set onerror(listener: EventListener | null) {
    this.webSocket.onerror = listener;
  }

  get onclose(): EventListener | null {
    return this.webSocket.onclose;
  }

  set onclose(listener: EventListener | null) {
    this.webSocket.onclose = listener;
  }

  get onmessage(): EventListener | null {
    return this.webSocket.onmessage;
  }

  set onmessage(listener: EventListener | null) {
    this.webSocket.onmessage = listener;
  }

  addEventListener(
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions
  ): void {
    this.webSocket.addEventListener(type, listener, options);
  }

  removeEventListener(
    type: string,
    listener: EventListener,
    options?: EventListenerOptions | boolean
  ): void {
    this.webSocket.removeEventListener(type, listener, options);
  }

  dispatchEvent(event: Event): boolean {
    return this.webSocket.dispatchEvent(event);
  }

  send(data: string | ArrayBuffer | Blob | ArrayBufferView): void {
    this.webSocket.send(data);
  }

  close(code?: number, reason?: string): void {
    this.webSocket.close(code, reason);
  }
}
