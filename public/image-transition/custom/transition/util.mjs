export const optional = (...args) => {
  for (var i = 0; i < args.length; i++) {
    if (args[i] !== undefined) return args[i];
  }
};

// replaced tweenmax to reduce file size, works with both
export const tween = async (targets, value, duration, easing, update) =>
  new Promise(complete =>
    anime({
      targets,
      value,
      duration,
      easing,
      update,
      complete
    })
  );
