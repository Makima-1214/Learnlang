/**
 * Unit tests for socket helper functions
 */

import {
  getPrivateChatRoom,
  emitNewPrivateMessage,
  emitNewNotification,
  emitNewFriendRequest,
  emitToRoom,
} from "@/lib/socket";

describe("Socket helpers", () => {
  let toMock;
  let emitMock;

  beforeEach(() => {
    emitMock = jest.fn();
    toMock = jest.fn(() => ({ emit: emitMock }));
    global.io = { to: toMock };
  });

  afterEach(() => {
    delete global.io;
    jest.restoreAllMocks();
  });

  it("should create deterministic private chat room", () => {
    const roomA = getPrivateChatRoom("user-b", "user-a");
    const roomB = getPrivateChatRoom("user-a", "user-b");

    expect(roomA).toBe("dm:user-a:user-b");
    expect(roomB).toBe("dm:user-a:user-b");
  });

  it("should emit private message (receiverId, message signature)", () => {
    const message = {
      id: "m1",
      senderId: "user-1",
      receiverId: "user-2",
      content: "hello",
    };

    emitNewPrivateMessage("user-2", message);

    expect(toMock).toHaveBeenCalledWith("user:user-2");
    expect(toMock).toHaveBeenCalledWith("user:user-1");
    expect(toMock).toHaveBeenCalledWith("dm:user-1:user-2");
    expect(emitMock).toHaveBeenCalledWith("private-message", message);
  });

  it("should emit private message (senderId, receiverId, message signature)", () => {
    const message = {
      id: "m2",
      senderId: "user-1",
      receiverId: "user-2",
      content: "old signature",
    };

    emitNewPrivateMessage("user-1", "user-2", message);

    expect(toMock).toHaveBeenCalledWith("user:user-2");
    expect(toMock).toHaveBeenCalledWith("user:user-1");
    expect(toMock).toHaveBeenCalledWith("dm:user-1:user-2");
    expect(emitMock).toHaveBeenCalledWith("private-message", message);
  });

  it("should emit friend request and notification to user room", () => {
    const request = { id: "fr1" };
    const notification = { id: "n1" };

    emitNewFriendRequest("user-9", request);
    emitNewNotification("user-9", notification);

    expect(toMock).toHaveBeenCalledWith("user:user-9");
    expect(emitMock).toHaveBeenCalledWith("friend-request", request);
    expect(emitMock).toHaveBeenCalledWith("notification", notification);
  });

  it("should not throw when io not initialized in emitToRoom", () => {
    delete global.io;
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => emitToRoom("room:x", "evt", { ok: true })).not.toThrow();
    expect(errorSpy).toHaveBeenCalled();
  });
});
