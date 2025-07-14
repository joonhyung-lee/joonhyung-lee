const WEATHER_API_KEY = process.env.WEATHER_API_KEY
console.log('API KEY:', process.env.WEATHER_API_KEY);

import fs from 'fs'
import got from 'got'
import Qty from 'js-quantities/esm'
import { formatDistance } from 'date-fns'

const emojis = {
  '01d': '☀️',
  '02d': '⛅️',
  '03d': '☁️',
  '04d': '☁️',
  '09d': '🌧',
  '10d': '🌦',
  '11d': '🌩',
  '13d': '❄️',
  '50d': '🌫'
}

// Cheap, janky way to have variable bubble width
const dayBubbleWidths = {
  Monday: 235,
  Tuesday: 235,
  Wednesday: 260,
  Thursday: 245,
  Friday: 220,
  Saturday: 245,
  Sunday: 230,
}

// Time working at PlanetScale
const today = new Date()
const todayDay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(today)

const psTime = formatDistance(new Date(2020, 12, 14), today, {
  addSuffix: false,
})

// Today's weather (OpenWeatherMap)
const city = 'Seoul'
const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`

got(url)
  .then((response) => {
    let json = JSON.parse(response.body)

    // 온도 (섭씨, 화씨)
    const degC = Math.round(json.main.temp_max)
    const degF = Math.round((json.main.temp_max * 9) / 5 + 32)
    // 날씨 아이콘
    const icon = json.weather[0].icon
    // 이모지
    const weatherEmoji = emojis[icon] || ''

    fs.readFile('template.svg', 'utf-8', (error, data) => {
      if (error) {
        console.error(error)
        return
      }

      data = data.replace('{degF}', degF)
      data = data.replace('{degC}', degC)
      data = data.replace('{weatherEmoji}', weatherEmoji)
      data = data.replace('{psTime}', psTime)
      data = data.replace('{todayDay}', todayDay)
      data = data.replace('{dayBubbleWidth}', dayBubbleWidths[todayDay])

      fs.writeFile('chat.svg', data, (err) => {
        if (err) {
          console.error(err)
          return
        }
      })
    })
  })
  .catch((err) => {
    console.error(err)
  })