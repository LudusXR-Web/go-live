"use client";

import { io } from "socket.io-client";

export const useSocket = (...args: Parameters<typeof io>) => io(...args);
