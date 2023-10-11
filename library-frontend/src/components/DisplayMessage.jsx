const DisplayMessage = (setNotifyMessage, { ...message }) => {
  var delay = 5000;
  if (message.length) {
    delay = message.length;
  }
  setNotifyMessage({
    message: `${message.message}`,
    messageType: `${message.messageType}`,
  });
  setTimeout(() => {
    setNotifyMessage({
      message: null,
      messageType: "success",
    });
    if (message.reload === true) {
      window.location.reload(false);
    }
  }, delay);
};

export default DisplayMessage;
