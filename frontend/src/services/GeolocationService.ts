export interface GeolocationCoordinates {
  latitude: number
  longitude: number
  accuracy: number
}

export class GeolocationService {
  async getCurrentPosition(): Promise<GeolocationCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          })
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`))
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      )
    })
  }

  watchPosition(
    callback: (coords: GeolocationCoordinates) => void,
    errorCallback?: (error: Error) => void
  ): number {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by your browser')
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
      },
      (error) => {
        if (errorCallback) {
          errorCallback(new Error(`Geolocation error: ${error.message}`))
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    )
  }

  clearWatch(watchId: number): void {
    navigator.geolocation.clearWatch(watchId)
  }
}
