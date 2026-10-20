'use strict';

const skillsBoard = document.querySelector('#skills-board');
const skillsLayer = document.querySelector('.skills-stickers');
const skillsClear = document.querySelector('#skills-clear');
const skillsStatus = document.querySelector('#skills-status');

if (skillsBoard && skillsLayer && skillsClear && skillsStatus) {
  const stickers = [
    { name: 'Illustrator', file: 'illustrator.png' },
    { name: 'Photoshop', file: 'photoshop.png' },
    { name: 'Figma', file: 'figma.png' },
    { name: 'Notion', file: 'notion.png' },
    { name: 'InDesign', file: 'indesign.png' },
    { name: 'ChatGPT', file: 'chatgpt.png' },
    { name: 'JavaScript', file: 'javascript.png' },
    { name: 'Zoom', file: 'zoom.png' },
    { name: 'Slack', file: 'slack.png' },
    { name: 'Claude', file: 'claude.png' }
  ];
  const limit = 40;
  let deck = [];
  let previous = null;

  // Warm the small PNGs so the first placement can appear immediately.
  stickers.forEach(sticker => {
    const image = new Image();
    image.src = `assets/stickers/${sticker.file}`;
  });

  function nextSticker() {
    if (!deck.length) {
      deck = stickers.slice();
      for (let index = deck.length - 1; index > 0; index--) {
        const other = Math.floor(Math.random() * (index + 1));
        [deck[index], deck[other]] = [deck[other], deck[index]];
      }
      if (previous === null) {
        const figmaIndex = deck.findIndex(sticker => sticker.file === 'figma.png');
        [deck[figmaIndex], deck[deck.length - 1]] = [deck[deck.length - 1], deck[figmaIndex]];
      } else if (deck[deck.length - 1] === previous) {
        [deck[0], deck[deck.length - 1]] = [deck[deck.length - 1], deck[0]];
      }
    }
    previous = deck.pop();
    return previous;
  }

  skillsBoard.addEventListener('click', event => {
    const bounds = skillsBoard.getBoundingClientRect();
    const fromKeyboard = event.detail === 0 && !event.pointerType;
    const x = fromKeyboard ? .2 + Math.random() * .6 : (event.clientX - bounds.left) / bounds.width;
    const y = fromKeyboard ? .4 + Math.random() * .35 : (event.clientY - bounds.top) / bounds.height;
    const sticker = nextSticker();
    const image = document.createElement('img');
    image.src = `assets/stickers/${sticker.file}`;
    image.alt = '';
    image.className = 'skill-sticker';
    image.dataset.skill = sticker.name;
    image.draggable = false;
    image.style.left = `${Math.max(0, Math.min(1, x)) * 100}%`;
    image.style.top = `${Math.max(0, Math.min(1, y)) * 100}%`;
    image.style.setProperty('--sticker-angle', `${Math.random() * 24 - 12}deg`);
    if (skillsLayer.children.length >= limit) skillsLayer.firstElementChild.remove();
    skillsLayer.append(image);
    skillsBoard.closest('.skills-section').classList.add('has-stickers');
    skillsClear.disabled = false;
    skillsStatus.textContent = `${sticker.name} sticker added. ${skillsLayer.children.length} stickers on the board.`;
  });

  skillsClear.addEventListener('click', () => {
    skillsLayer.replaceChildren();
    skillsBoard.closest('.skills-section').classList.remove('has-stickers');
    deck = [];
    previous = null;
    skillsClear.disabled = true;
    skillsStatus.textContent = 'All skill stickers cleared.';
    skillsBoard.focus({ preventScroll: true });
  });
}
