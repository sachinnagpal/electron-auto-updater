module.exports = {
  packagerConfig: {
    win32metadata: {
      "requested-execution-level": "requireAdministrator"
    },
    "asar": true 
  },
  rebuildConfig: {},
  publishers: [
    {
      name: 'electron-forge-publisher-local',
      config: {
        directory: '/Users/sachinnagpal/Desktop/repos/git/electron/electron-node-14.20.1/releases'
      }
    }
  ],
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        authors: 'Sachin',
        description: 'An example Electron app'
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
};
