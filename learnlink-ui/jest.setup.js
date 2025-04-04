// jest.setup.js
Object.defineProperty(window, 'location', {
    value: {
      href: '',
    },
    writable: true,
  });
  