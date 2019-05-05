import emojis from './emojis'
import style from './style.module.css'

const { access_token, token_type } = window.location.hash
  .slice(1)
  .split('&')
  .map(hash => hash.split('='))
  .reduce((hashes, [hash, value]) => ({ ...hashes, [hash]: value }), {})

const fetchData = async endpoint =>
  await fetch(`https://api.spotify.com/v1/${endpoint}`, {
    headers: { Authorization: `${token_type} ${access_token}` },
  })

const getCurrentlyPlaying = async () =>
  await fetchData('me/player/currently-playing').then(res => res.json())

const getAudioFeatures = async () => {
  const currentTrack = await getCurrentlyPlaying()

  const albumImage = currentTrack.item.album.images[0]
  document.body.style.backgroundImage = `url(${albumImage.url})`

  if (currentTrack.is_playing) {
    const audioFeatures = await fetchData(
      `audio-features/${currentTrack.item.id}`
    ).then(res => res.json())
    return audioFeatures
  }
}
const showFeatures = async () => {
  const audioFeatures = await getAudioFeatures()
  if (audioFeatures) {
    const featureKeys = [
      'acousticness',
      'danceability',
      'energy',
      'instrumentalness',
      'valence',
    ]
    const features = Object.entries(audioFeatures)
      .filter(([feature]) => featureKeys.includes(feature))
      .map(([feature, value]) => ({
        feature,
        emoji: emojis[feature][Math.round(value)],
        value,
      }))

    const container = document.createElement('div')
    container.classList.add(style.container)
    document.body.appendChild(container)

    const featureElements = ['feature', 'emoji', 'value'].map(type => {
      const el = document.createElement('span')
      el.classList.add(style[type])
      return el
    })
    container.append(...featureElements)

    const renderFeature = ({ feature, value, emoji }) => {
      featureElements[0].innerHTML = feature
      featureElements[1].innerHTML = emoji
      featureElements[2].innerHTML = `${Math.round(value * 100)}%`
    }

    let i = 0
    setInterval(() => {
      const n = features.length
      const feature = features[((i % n) + n) % n]
      renderFeature(feature, container)
      i++
    }, 1500)
  }
}

showFeatures()
