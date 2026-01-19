export type MapConnection = google.maps.Polyline;
export type MapConnectionKey = string;

export class MapConnectionsRegistry {
    private readonly connections = new Map<MapConnectionKey, MapConnection>();

    constructor(private readonly map: google.maps.Map) {
    }

    get(connectionKey: MapConnectionKey): MapConnection | undefined {
        return this.connections.get(connectionKey);
    }

    add(connectionKey: MapConnectionKey, connection: MapConnection) {
        this.connections.set(connectionKey, connection);
    }

    buildConnection(
        { coordinates, color }:
        {
            coordinates: [number, number][],
            color: string,
        }
    ): MapConnection {

        const path = this.buildPath(coordinates);

        return new google.maps.Polyline({
            path,
            strokeColor: color,
            strokeWeight: 3
        });
    }

    private buildPath(endpointCoordinates: [number, number][]): google.maps.LatLng[] {
        // if we need to implement driving directions later, this is where we would do it.
        // instead of just returning the two endpoints, we could call the API and return the full path.
        // these builder functions would need additional parameters to specify which approach to use,
        // as not all connections need to be driving directions.
        // also we would need to handle the asynchronous nature of such calls.
        return endpointCoordinates.map(coordinates => new google.maps.LatLng(...coordinates));
    }

    updateConnectionIfNotIdentical(
        { connectionKey, coordinates, color }:
        {
            connectionKey: MapConnectionKey,
            coordinates: [number, number][],
            color: string,
        }
    ) {
        const oldConnection = this.connections.get(connectionKey);
        if (!oldConnection) {
            return;
        }

        // compare the current and new path by their string representation to avoid unnecessary updates
        const currentPath = oldConnection.getPath().getArray();
        const newPath = this.buildPath(coordinates);

        const currentPathFingerprint = currentPath.map(p => p.toUrlValue(6)).join("|");
        const newPathFingerprint = newPath.map(p => p.toUrlValue(6)).join("|");

        if (currentPathFingerprint !== newPathFingerprint) {
            oldConnection.setPath(newPath);
        }

        if (oldConnection.get("strokeColor") !== color) {
            oldConnection.set("strokeColor", color);
        }
    }

    delete(connectionKey: MapConnectionKey) {
        const connection = this.connections.get(connectionKey);
        if (!connection) {
            return;
        }

        this.hideConnection(connection);
        this.connections.delete(connectionKey);
    }

    showConnectionsWithinArea(area: google.maps.LatLngBounds) {
        this.connections.forEach((connection: MapConnection) => {
            // only show lines whose path is at least partially within the given area
            const isPartiallyWithinArea = this.isConnectionPartiallyWithinArea(connection, area);
            if (isPartiallyWithinArea) {
                this.showConnection(connection);
            } else {
                this.hideConnection(connection);
            }
        });
    }

    hideAllConnections() {
        this.connections.forEach((connection: MapConnection) => this.hideConnection(connection));
    }

    destroy() {
        this.hideAllConnections();
        this.connections.clear();
    }

    deleteUnneededConnections( { neededConnectionKeys }: { neededConnectionKeys: Set<MapConnectionKey> }) {
        const existingConnectionKeys = this.connections.keys();
        for (const existingConnectionKey of existingConnectionKeys) {
            if (!neededConnectionKeys.has(existingConnectionKey)) {
                this.delete(existingConnectionKey);
            }
        }
    }

    private isConnectionPartiallyWithinArea(connection: MapConnection, area: google.maps.LatLngBounds) {
        const path = connection.getPath();

        for (const point of path.getArray()) {
            if (area.contains(point)) {
                return true;
            }
        }

        return false;
    }

    public async calculateDrivingTimeForConnection(connectionKey: MapConnectionKey) {
        const service = new google.maps.DistanceMatrixService();
        const connection = this.connections.get(connectionKey);
        const from = connection?.getPath().getAt(0);
        const to = connection?.getPath().getAt(connection.getPath().getLength() - 1);

        const response = await service.getDistanceMatrix({
            origins: [from as google.maps.LatLng],
            destinations: [to as google.maps.LatLng],
            travelMode: google.maps.TravelMode.DRIVING,
        });

        return response.rows[0]?.elements[0]?.duration?.value || 0; // duration in seconds
    }

    private showConnection(connection: MapConnection) {
        connection.setMap(this.map);
    }

    private hideConnection(connection: MapConnection) {
        connection.setMap(null);
    }

}
