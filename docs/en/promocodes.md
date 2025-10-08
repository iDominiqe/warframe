---
layout: doc
---

<script setup>
import { ref } from 'vue'

const viewMode = ref('grid') // 'grid' or 'list'

const promocodes = [
  {
    id: 1,
    title: 'OLDFRIEND',
    description: 'Old Friend Glyph',
    image: 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?auto=compress&cs=tinysrgb&w=400',
    code: 'OLDFRIEND',
    link: 'https://www.warframe.com/promocode?code=OLDFRIEND'
  },
  {
    id: 2,
    title: 'ADMIRALBAHROO',
    description: 'Admiral Bahroo Glyph',
    image: 'https://images.pexels.com/photos/2832382/pexels-photo-2832382.jpeg?auto=compress&cs=tinysrgb&w=400',
    code: 'ADMIRALBAHROO',
    link: 'https://www.warframe.com/promocode?code=ADMIRALBAHROO'
  },
  {
    id: 3,
    title: 'ORIGINALWICKEDFUN',
    description: 'Original Wicked Fun Glyph',
    image: 'https://images.pexels.com/photos/3945657/pexels-photo-3945657.jpeg?auto=compress&cs=tinysrgb&w=400',
    code: 'ORIGINALWICKEDFUN',
    link: 'https://www.warframe.com/promocode?code=ORIGINALWICKEDFUN'
  },
  {
    id: 4,
    title: 'PROFESSORBROMAN',
    description: 'Professor Broman Glyph',
    image: 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?auto=compress&cs=tinysrgb&w=400',
    code: 'PROFESSORBROMAN',
    link: 'https://www.warframe.com/promocode?code=PROFESSORBROMAN'
  },
  {
    id: 5,
    title: 'TACTICALPOTATO',
    description: 'Tactical Potato Glyph',
    image: 'https://images.pexels.com/photos/2832382/pexels-photo-2832382.jpeg?auto=compress&cs=tinysrgb&w=400',
    code: 'TACTICALPOTATO',
    link: 'https://www.warframe.com/promocode?code=TACTICALPOTATO'
  },
  {
    id: 6,
    title: 'MCGAMERCZ',
    description: 'McGamerCZ Glyph',
    image: 'https://images.pexels.com/photos/3945657/pexels-photo-3945657.jpeg?auto=compress&cs=tinysrgb&w=400',
    code: 'MCGAMERCZ',
    link: 'https://www.warframe.com/promocode?code=MCGAMERCZ'
  },
  {
    id: 7,
    title: 'IFLYNN',
    description: 'iFlynn Glyph',
    image: 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?auto=compress&cs=tinysrgb&w=400',
    code: 'IFLYNN',
    link: 'https://www.warframe.com/promocode?code=IFLYNN'
  },
  {
    id: 8,
    title: 'MOGAMU',
    description: 'Mogamu Glyph',
    image: 'https://images.pexels.com/photos/2832382/pexels-photo-2832382.jpeg?auto=compress&cs=tinysrgb&w=400',
    code: 'MOGAMU',
    link: 'https://www.warframe.com/promocode?code=MOGAMU'
  }
]

const copyToClipboard = async (code) => {
  try {
    await navigator.clipboard.writeText(code)
    alert(`Promocode "${code}" copied to clipboard!`)
  } catch (err) {
    alert('Failed to copy promocode')
  }
}

const toggleView = (mode) => {
  viewMode.value = mode
}
</script>

# Warframe Promocodes

Active promocodes for free glyphs and other rewards in Warframe.

<div class="view-controls">
  <button
    :class="['view-btn', { active: viewMode === 'grid' }]"
    @click="toggleView('grid')"
  >
    <span class="icon">⊞</span> Grid
  </button>
  <button
    :class="['view-btn', { active: viewMode === 'list' }]"
    @click="toggleView('list')"
  >
    <span class="icon">☰</span> List
  </button>
</div>

<div :class="['promocodes-container', viewMode]">
  <div
    v-for="promo in promocodes"
    :key="promo.id"
    class="promo-card"
  >
    <div class="promo-image">
      <img :src="promo.image" :alt="promo.title" />
    </div>
    <div class="promo-content">
      <h3>{{ promo.title }}</h3>
      <p>{{ promo.description }}</p>
      <div class="promo-actions">
        <button
          class="btn btn-copy"
          @click="copyToClipboard(promo.code)"
        >
          📋 Copy
        </button>
        <a
          :href="promo.link"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-activate"
        >
          🔗 Activate
        </a>
      </div>
    </div>
  </div>
</div>

## How to use promocodes?

1. **Copy the promocode** - click the "Copy" button
2. **Activate** - go to the official Warframe website via "Activate" button
3. **Login to your account** - authorize on the website
4. **Get your reward** - the promocode will be applied automatically

## Important information

- Promocodes can only be activated once per account
- Some promocodes may have expiration dates
- Glyphs can be used on equipment and profile
- Check promocode validity on official sources

<style scoped>
.view-controls {
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
  justify-content: flex-end;
}

.view-btn {
  padding: 0.5rem 1.5rem;
  border: 2px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.view-btn:hover {
  border-color: var(--vp-c-brand);
  background: var(--vp-c-bg);
}

.view-btn.active {
  border-color: var(--vp-c-brand);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand);
}

.icon {
  font-size: 1.2rem;
}

.promocodes-container {
  display: grid;
  gap: 2rem;
  margin: 2rem 0;
}

.promocodes-container.grid {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.promocodes-container.list {
  grid-template-columns: 1fr;
}

.promo-card {
  border: 2px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: var(--vp-c-bg-soft);
}

.promo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-color: var(--vp-c-brand);
}

.grid .promo-card {
  display: flex;
  flex-direction: column;
}

.list .promo-card {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 1.5rem;
}

.promo-image {
  width: 100%;
  overflow: hidden;
  background: var(--vp-c-bg);
}

.grid .promo-image {
  height: 200px;
}

.list .promo-image {
  height: 100%;
  min-height: 150px;
}

.promo-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.promo-card:hover .promo-image img {
  transform: scale(1.05);
}

.promo-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.promo-content h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--vp-c-brand);
  border: none;
}

.promo-content p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.95rem;
  flex-grow: 1;
}

.promo-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn {
  flex: 1;
  padding: 0.625rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  text-align: center;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-copy {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border: 2px solid var(--vp-c-divider);
}

.btn-copy:hover {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

.btn-activate {
  background: var(--vp-c-brand);
  color: white;
  border: 2px solid var(--vp-c-brand);
}

.btn-activate:hover {
  background: var(--vp-c-brand-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .promocodes-container.grid {
    grid-template-columns: 1fr;
  }

  .list .promo-card {
    grid-template-columns: 1fr;
  }

  .list .promo-image {
    height: 200px;
  }

  .promo-actions {
    flex-direction: column;
  }

  .view-controls {
    justify-content: center;
  }
}
</style>
