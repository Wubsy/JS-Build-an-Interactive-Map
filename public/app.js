// map object
const inputAPIKey = window.prompt("Enter YOUR API key for foursquare", "")
const mapObject = {
    map: {},
    coords: [],
    business: [],
    points: {},
    pointLayerMap: {},

    buildMap() {
        this.map = L.map('map', { //L is from leaflet module
            center: this.coords,
            zoom: 10,
        })
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            minZoom: '10',
        }).addTo(this.map)

        const point = L.marker(this.coords)
        point.addTo(this.map).bindPopup('<b>Current Location</b>').openPopup()
    },
    addMarkersToMap() {
        //let pointLayer = L.addLayer().addTo(this.map)
        for(let i = 0; i < this.business.length; i++) {
            this.points = L.marker([
                this.business[i].latitude,
                this.business[i].longitude,
            //]).bindPopup(`<p1>${this.business[i].name}</p1>`).addTo(pointLayer)
            ]).bindPopup(`<p1>${this.business[i].name}</p1>`).addTo(this.map)
        }
    },
    clearOldMarkers() { //TODO: Find a way to make this work (somehow)
        L.removeLayer(this.pointLayerMap)
    }

}

function sortBusinessData(businessData) {
    let businesses = businessData.map((element) => {
        let location = {
            name: element.name,
            latitude: element.geocodes.main.latitude, //Data from response
            longitude: element.geocodes.main.longitude,
        }
        return location
    })
    return businesses
}

async function getCoords() {
    const pos = await new Promise((resolve,reject) => {
        navigator.geolocation.getCurrentPosition(resolve,reject)
    })
    return [pos.coords.latitude, pos.coords.longitude]
}

// get foursquare businesses
const options = {method: 'GET', headers: {
    Accept: 'application/json',
    //Authorization: getAPIKey()
    Authorization: inputAPIKey
}};
async function getBusinessFromAPI(businessType) {
    let ll = await getCoords()
    let resp = await fetch(`https://api.foursquare.com/v3/places/nearby?ll=${ll}&query=${businessType}`, options).catch(err => console.error(err));
    let respData = JSON.parse(await resp.text())
    return respData.results
}


window.onload = async () => {
    const coords = await getCoords()
    console.log(coords)
    mapObject.coords = coords
    mapObject.buildMap()
}

// business submit button
document.getElementById('submitButton').addEventListener('click', async (event) => {
    //mapObject.clearOldMarkers()
    event.preventDefault()
    let business = document.getElementById('business').value
    let mapData = await getBusinessFromAPI(business)
    console.log(mapData)
    console.log(mapObject.points)
    mapObject.business = sortBusinessData(mapData)
    mapObject.addMarkersToMap()
})