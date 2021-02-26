// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type Direction = 'up' | 'right' | 'down' | 'left';

export type DeviceType = {
  deviceId: string;
  label: string;
};

export type SelectedDeviceId = string | null;

export type DeviceTypeContext = {
  devices: DeviceType[];
  selectedDevice: SelectedDeviceId;
};

export type DeviceConfig = {
  /** Whether to include additional devices (such as "Color bars" for video, "440Hz" for audio) in the available devices list */
  additionalDevices?: boolean;
};

export type LocalAudioOutputContextType = {
  isAudioOn: boolean;
  toggleAudio: () => void;
  setVolume: (volume: number) => void;
  getVolume: () => number;
};

export type LocalVideoContextType = {
  tileId: null | number;
  isVideoEnabled: boolean;
  toggleVideo: () => Promise<void>;
};

export type ContentShareControlContextType = {
  paused: boolean;
  toggleContentShare: () => Promise<void>;
  togglePauseContentShare: () => void;
};

export enum MeetingStatus {
  Loading,
  Succeeded,
  Failed,
  Ended,
}

export enum SessionConnection {
  Reconnecting,
  Connecting,
}

export type RosterAttendeeType = {
  chimeAttendeeId: string;
  externalUserId?: string;
  uid?: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  companyTitle?: string;
  role?: string;
  avatar?: string;
  fullName?: string;
};

export type RosterType = {
  [attendeeId: string]: RosterAttendeeType;
};
