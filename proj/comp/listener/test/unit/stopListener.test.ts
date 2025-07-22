import { describe, it, expect, vi } from 'vitest';
import { writeFile, mkdir, rm } from 'fs/promises';
import { dirname } from 'path';
import fs from 'fs';
import { startListener, stopListener } from '../../src/listener.js';

// Mock fs.watchFile/unwatchFile
vi.mock('fs', async () => {
  const actual = await vi.importActual<typeof fs>('fs');
  return {
    ...actual,
    watchFile: vi.fn(),
    unwatchFile: vi.fn()
  };
});

describe('stopListener', () => {
  const testFile = '/tmp/t_stop_listener/test.md';

  beforeEach(async () => {
    vi.clearAllMocks();
    await mkdir(dirname(testFile), { recursive: true });
    await writeFile(testFile, 'test content');
  });

  afterEach(async () => {
    await rm(dirname(testFile), { recursive: true, force: true });
  });

  it('stops watching and cleans up', async () => {
    const handle = await startListener({ filePath: testFile });
    
    // Verify watchFile was called
    expect(fs.watchFile).toHaveBeenCalledWith(
      testFile,
      expect.any(Object),
      expect.any(Function)
    );

    // Stop the listener
    await stopListener(handle);

    // Verify unwatchFile was called
    expect(fs.unwatchFile).toHaveBeenCalledWith(testFile);
  });

  it('prevents duplicate watching after stop', async () => {
    const handle = await startListener({ filePath: testFile });
    await stopListener(handle);

    // Should be able to watch again after stopping
    const handle2 = await startListener({ filePath: testFile });
    expect(handle2.filePath).toBe(testFile);
    
    await stopListener(handle2);
  });
});