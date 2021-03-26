// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
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
export type LocalVideoState = 'enabled' | 'disabled' | 'pending';

export type LocalVideoContextType = {
  tileId: null | number;
  toggleVideo: () => Promise<void>;
  videoEl: React.RefObject<HTMLVideoElement>;
  isLocalVideoEnabled: LocalVideoState;
  setIsLocalVideoEnabled: React.Dispatch<React.SetStateAction<LocalVideoState>>;
  canSendLocalVideo: boolean;
  setCanSendLocalVideo: (canSendLocalVideo: boolean) => void;
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
  JoinedFromAnotherDevice
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
  cardIndex: number;
  order: number;
  isPinned: boolean;
  fullName?: string;
};

export type RosterType = {
  [attendeeId: string]: RosterAttendeeType;
};

export enum DevicePermissionStatus {
  UNSET = 'UNSET',
  IN_PROGRESS = 'IN_PROGRESS',
  GRANTED = 'GRANTED',
  DENIED = 'DENIED',
};


export type SendVideoMessagePayload = {
  meetingId: string;
  attendeeId: string;
}

export enum SendVideoMessageType {
  START_VIDEO = 'start-video',
  STOP_VIDEO = 'stop-video',
}

export type Message = {
  type: SendVideoMessageType;
  payload: SendVideoMessagePayload;
}
