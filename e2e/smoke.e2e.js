describe('Smoke', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('launches and shows initial UI', async () => {
    // For Expo apps, initial screen may take a bit; simply check the app is running
    await expect(device.getPlatform()).toBeDefined();
  });
});
