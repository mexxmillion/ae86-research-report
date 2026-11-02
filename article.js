addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  document.getElementById('progress').style.width = (max > 0 ? scrollY / max * 100 : 0) + '%';
}, {passive: true});

document.querySelectorAll('.model-card').forEach(card => {
  const model = card.querySelector('model-viewer');
  const select = card.querySelector('select');
  const slider = card.querySelector('input');
  const status = card.querySelector('output');
  let ready = false;
  const describe = () => {
    const time = Number(model.currentTime || 0), duration = Number(model.duration || 0);
    status.textContent = (select.selectedOptions[0]?.textContent || 'Animation') +
      ' · ' + time.toFixed(2) + ' / ' + duration.toFixed(2) + ' s';
  };
  model.addEventListener('load', () => {
    ready = true;
    select.replaceChildren();
    for (const name of model.availableAnimations) {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name.replace('PIVOT_', '').replace('Action', '').replaceAll('_', ' ');
      select.append(option);
    }
    const combined = model.availableAnimations.find(a => a === 'Doors and wheels');
    if (combined) select.value = combined;
    model.animationName = select.value;
    model.pause();
    model.currentTime = 0;
    status.textContent = 'Ready - choose a pose or press Play.';
  });
  select.addEventListener('change', () => {
    if (!ready) return;
    model.animationName = select.value;
    model.pause(); model.currentTime = 0; slider.value = 0; describe();
  });
  card.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => {
    if (!ready) { model.dismissPoster(); return; }
    const action = button.dataset.action;
    if (action === 'play') {
      model.paused ? model.play() : model.pause();
    } else {
      model.pause();
      model.currentTime = action === 'open' ? Math.max(0, model.duration - .001) : 0;
      slider.value = action === 'open' ? 1 : 0;
    }
    describe();
  }));
  slider.addEventListener('input', () => {
    if (!ready) return;
    model.pause(); model.currentTime = Number(slider.value) * Math.max(0, model.duration - .001);
    describe();
  });
});
