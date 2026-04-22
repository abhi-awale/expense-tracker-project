const FLASH_COOKIE = 'expensepilot_flash';

const parseFlashCookie = (value) => {
  if (!value) {
    return {};
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return {};
  }
};

module.exports = () => (req, res, next) => {
  const flashStore = parseFlashCookie(req.cookies[FLASH_COOKIE]);
  let touched = false;

  req.flash = (type, value) => {
    if (typeof value === 'undefined') {
      const messages = flashStore[type] || [];
      delete flashStore[type];
      touched = true;
      return messages;
    }

    flashStore[type] = flashStore[type] || [];
    flashStore[type].push(value);
    touched = true;
    return flashStore[type].length;
  };

  const originalEnd = res.end.bind(res);
  res.end = (...args) => {
    if (touched) {
      if (Object.keys(flashStore).length === 0) {
        res.clearCookie(FLASH_COOKIE);
      } else {
        res.cookie(FLASH_COOKIE, JSON.stringify(flashStore), {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        });
      }
    }

    return originalEnd(...args);
  };

  next();
};
