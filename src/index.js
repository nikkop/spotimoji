const { access_token, token_type, expires_in, state } = window.location.hash
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
  if (currentTrack.is_playing) {
    const audioFeatures = await fetchData(
      `audio-features/${currentTrack.item.id}`
    ).then(res => res.json())
    console.log(audioFeatures)
  }
}

getAudioFeatures()
