export const load = (loader, url) =>
  new Promise(resolve => loader.load(url, resolve));

export const optional = (...args) => {
  for (var i = 0; i < args.length; i++) {
    if (args[i] !== undefined) return args[i];
  }
};

export const time = dur => new Promise(resolve => setTimeout(resolve, dur));

// TODO: allow this to be passed in to decouple tweening library
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

export const sourcesToPairs = (sources = []) =>
  sources.reduce((acc, _, idx) => {
    const [from, to] = sources.slice(idx, idx + 2);
    // normal case, both exist
    if (from && to) acc.push([from, to]);
    // final case, no next item so loop back to first
    else if (from) acc.push([from, sources[0]]);
    // else badness
    return acc;
  }, []);
