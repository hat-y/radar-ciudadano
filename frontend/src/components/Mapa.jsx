import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet/dist/leaflet.css';
import { useRef, useState } from 'react';
import { Circle, FeatureGroup, LayersControl, MapContainer, Marker, Polygon, Popup, TileLayer } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import '../App.css';

function Mapa() {

  const mapRef = useRef(null);

  const [layers, setLayers] = useState([]);

  const onCreate = (e) => {
  const { layerType, layer } = e;
  const nombre = prompt('Ingrese el nombre');

  let coords, radius;

  switch (layerType) {
    case 'marker':
      coords = layer.getLatLng();
      break;
    case 'circle':
      coords = layer.getLatLng();
      radius = layer.getRadius();
      break;
    case 'polygon':
      coords = layer.getLatLngs()[0];
      break;
    default:
      return;
  }

  setLayers(prev => [
    ...prev,
    { id: layer._leaflet_id, nombre, type: layerType, coords, radius }
  ]);
};


  const flyTo = (coords, type) => {
    const map = mapRef.current;
    if (!map) return;

    if (type === "marker" || type === "circle") {
      // coords: { lat, lng }
      map.flyTo(coords, 15);
    } 
    else if (type === "polygon" && Array.isArray(coords)) {
      // coords: array de puntos [{lat, lng}, ...]
      try {
        const polygon = L.polygon(coords);
        const bounds = polygon.getBounds();
        map.fitBounds(bounds, { padding: [50, 50] })
      } catch (err) {
        console.error("Error calculando bounds del polígono:", err);
      }
    }
  };

  const onEdit = ({layers})=>{

    const editedLayers = layers.getLayers();

    editedLayers.forEach( editedLayer => setLayers( prev => prev.map( layer => editedLayer.options.id === layer.id ? {...layer, coords: editedLayer} : layer)));
    
  }

  const onDelete = (e)=>{
    e.layers.getLayers().forEach(deleteLayer => setLayers(prev => prev.filter( layer => layer.id !== deleteLayer.options.id)))
  }

  return (
      <section>
        <div className='map-container'>
          <MapContainer center={[-26.1852, -58.1744]} zoom={13} ref={mapRef}>
            
            <LayersControl>
              <LayersControl.BaseLayer checked name='Mapa 2D'>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors c'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </LayersControl.BaseLayer>
            </LayersControl>
            <FeatureGroup key={layers}>
              <EditControl
                onCreated={onCreate}
                onEdited={onEdit}
                onDeleted={onDelete}
                draw={{
                  marker: true,
                  circle: true,
                  rectangle: false,
                  circlemarker: false,
                  polyline: false,
                  polygon: true
                }}
              />
              {layers.map(layer => {
  switch (layer.type) {
    case 'marker':
      return (
        <Marker position={layer.coords} key={layer.id}>
          <Popup>{layer.nombre}</Popup>
        </Marker>
      );

    case 'circle':
      return (
        layer.radius && (
          <Circle
            center={layer.coords}
            radius={layer.radius}
            key={layer.id}
          />
        )
      );

    case 'polygon':
      return (
        <Polygon
          positions={layer.coords}
          key={layer.id}
        >
          <Popup>{layer.nombre}</Popup>
        </Polygon>
      );

    default:
      return null;
  }
})}
            </FeatureGroup>
      
          </MapContainer>
        </div>
        <div className='layers'>
          <h1>Reportes</h1>
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Coords</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {layers.map( (layer, i) => (
                <tr key={i}>
                  <td>{layer?.nombre}</td>
                  <td>{JSON.stringify(layer.coords)}</td>
                  <td><button
                      type="button"
                      onClick={() => flyTo(layer.coords, layer.type)}
                    >
                      Ir
                    </button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    // </main>
  )
}

export default Mapa