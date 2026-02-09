const terminalEventTarget = new EventTarget();

export type TerminalCommandEvent = {
  command: string;
};

const EVENT_NAME = 'centopeia:terminal-command';
const PROFILE_EVENT_NAME = 'centopeia:profile-updated';

export function emitTerminalCommand(command: string): void {
  terminalEventTarget.dispatchEvent(
    new CustomEvent<TerminalCommandEvent>(EVENT_NAME, { detail: { command } })
  );
}

export function onTerminalCommand(handler: (command: string) => void): () => void {
  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<TerminalCommandEvent>;
    const cmd = customEvent.detail?.command;
    if (cmd) handler(cmd);
  };
  terminalEventTarget.addEventListener(EVENT_NAME, listener as EventListener);
  return () => terminalEventTarget.removeEventListener(EVENT_NAME, listener as EventListener);
}

export type ProfileUpdatedEvent = {
  roleFocus: string;
  pathId?: string;
};

export function emitProfileUpdated(event: ProfileUpdatedEvent): void {
  terminalEventTarget.dispatchEvent(
    new CustomEvent<ProfileUpdatedEvent>(PROFILE_EVENT_NAME, { detail: event })
  );
}

export function onProfileUpdated(handler: (event: ProfileUpdatedEvent) => void): () => void {
  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<ProfileUpdatedEvent>;
    if (customEvent.detail) handler(customEvent.detail);
  };
  terminalEventTarget.addEventListener(PROFILE_EVENT_NAME, listener as EventListener);
  return () => terminalEventTarget.removeEventListener(PROFILE_EVENT_NAME, listener as EventListener);
}
