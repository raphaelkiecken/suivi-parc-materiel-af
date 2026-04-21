import { createServer } from 'node:http';
import { URL } from 'node:url';
import { equipmentList as equipmentData, maintenanceList as maintenanceData } from './data.js';

const port = process.env.PORT || 3001;

function setCorsHeaders(response) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendJson(response, statusCode, payload) {
    setCorsHeaders(response);
    response.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8'
    });
    response.end(JSON.stringify(payload));
}

function sendNotFound(response) {
    sendJson(response, 404, {
        message: 'Ressource introuvable.'
    });
}

function isValidDate(value) {
    if (typeof value !== 'string') {
        return false;
    }

    return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normalizeEquipmentPayload(payload) {
    if (!payload || typeof payload !== 'object') {
        return null;
    }

    const fields = [
        'name',
        'brand',
        'model',
        'serialNumber',
        'purchaseDate',
        'warrantyExpiration',
        'status',
        'position'
    ];

    for (const field of fields) {
        if (typeof payload[field] !== 'string') {
            return null;
        }
    }

    if (!isValidDate(payload.purchaseDate) || !isValidDate(payload.warrantyExpiration)) {
        return null;
    }

    return {
        name: payload.name.trim(),
        brand: payload.brand.trim(),
        model: payload.model.trim(),
        serialNumber: payload.serialNumber.trim(),
        purchaseDate: payload.purchaseDate,
        warrantyExpiration: payload.warrantyExpiration,
        status: payload.status.trim(),
        position: payload.position.trim()
    };
}

function normalizeMaintenancePayload(payload, includeEquipmentId) {
    if (!payload || typeof payload !== 'object') {
        return null;
    }

    const fields = [
        'date',
        'interventionType',
        'interventionStatus',
        'description',
        'performedBy',
        'notes'
    ];

    for (const field of fields) {
        if (typeof payload[field] !== 'string') {
            return null;
        }
    }

    if (!isValidDate(payload.date)) {
        return null;
    }

    if (typeof payload.downtimeMinutes !== 'number' || payload.downtimeMinutes < 0) {
        return null;
    }

    if (typeof payload.cost !== 'number' || payload.cost < 0) {
        return null;
    }

    const normalized = {
        date: payload.date,
        interventionType: payload.interventionType.trim(),
        interventionStatus: payload.interventionStatus.trim(),
        description: payload.description.trim(),
        performedBy: payload.performedBy.trim(),
        downtimeMinutes: payload.downtimeMinutes,
        notes: payload.notes.trim(),
        cost: payload.cost
    };

    if (!includeEquipmentId) {
        return normalized;
    }

    if (typeof payload.equipmentId !== 'number' || payload.equipmentId <= 0) {
        return null;
    }

    return {
        ...normalized,
        equipmentId: payload.equipmentId
    };
}

function getNextId(records) {
    if (records.length === 0) {
        return 1;
    }

    return Math.max(...records.map((record) => record.id)) + 1;
}

function findEquipmentById(id) {
    return equipmentData.find((item) => item.id === id) || null;
}

function parseJsonBody(request) {
    return new Promise((resolve, reject) => {
        let rawBody = '';

        request.on('data', (chunk) => {
            rawBody += chunk;
        });

        request.on('end', () => {
            if (!rawBody) {
                resolve({});
                return;
            }

            try {
                const parsed = JSON.parse(rawBody);
                resolve(parsed);
            } catch {
                reject(new Error('INVALID_JSON'));
            }
        });

        request.on('error', () => {
            reject(new Error('REQUEST_ERROR'));
        });
    });
}

async function handleGet(pathname, response) {
    if (pathname === '/api/health') {
        sendJson(response, 200, {
            status: 'ok',
            service: 'suivi-parc-materiel-af-api'
        });
        return true;
    }

    if (pathname === '/api/equipment') {
        sendJson(response, 200, equipmentData);
        return true;
    }

    if (pathname === '/api/maintenances') {
        sendJson(response, 200, maintenanceData);
        return true;
    }

    const equipmentPathMatch = pathname.match(/^\/api\/equipment\/(\d+)$/);
    if (equipmentPathMatch) {
        const equipmentId = Number.parseInt(equipmentPathMatch[1], 10);
        const equipment = findEquipmentById(equipmentId);

        if (!equipment) {
            sendNotFound(response);
            return true;
        }

        sendJson(response, 200, equipment);
        return true;
    }

    const maintenanceByEquipmentPathMatch = pathname.match(/^\/api\/equipment\/(\d+)\/maintenances$/);
    if (maintenanceByEquipmentPathMatch) {
        const equipmentId = Number.parseInt(maintenanceByEquipmentPathMatch[1], 10);

        if (!findEquipmentById(equipmentId)) {
            sendNotFound(response);
            return true;
        }

        const relatedMaintenances = maintenanceData.filter((record) => record.equipmentId === equipmentId);
        sendJson(response, 200, relatedMaintenances);
        return true;
    }

    const publicEquipmentPathMatch = pathname.match(/^\/api\/public\/equipment\/(\d+)$/);
    if (publicEquipmentPathMatch) {
        const equipmentId = Number.parseInt(publicEquipmentPathMatch[1], 10);
        const equipment = findEquipmentById(equipmentId);

        if (!equipment) {
            sendNotFound(response);
            return true;
        }

        const relatedMaintenances = maintenanceData
            .filter((record) => record.equipmentId === equipmentId)
            .sort((a, b) => b.date.localeCompare(a.date));

        sendJson(response, 200, {
            equipment,
            maintenances: relatedMaintenances
        });
        return true;
    }

    return false;
}

async function handlePost(pathname, request, response) {
    if (pathname === '/api/equipment') {
        try {
            const body = await parseJsonBody(request);
            const normalized = normalizeEquipmentPayload(body);

            if (!normalized) {
                sendJson(response, 400, {
                    message: 'Payload équipement invalide.'
                });
                return true;
            }

            const created = {
                id: getNextId(equipmentData),
                ...normalized
            };

            equipmentData.push(created);
            sendJson(response, 201, created);
        } catch {
            sendJson(response, 400, {
                message: 'Corps de requête JSON invalide.'
            });
        }
        return true;
    }

    if (pathname === '/api/maintenances') {
        try {
            const body = await parseJsonBody(request);
            const normalized = normalizeMaintenancePayload(body, true);

            if (!normalized) {
                sendJson(response, 400, {
                    message: 'Payload maintenance invalide.'
                });
                return true;
            }

            if (!findEquipmentById(normalized.equipmentId)) {
                sendJson(response, 400, {
                    message: 'equipmentId invalide.'
                });
                return true;
            }

            const created = {
                id: getNextId(maintenanceData),
                ...normalized
            };

            maintenanceData.push(created);
            sendJson(response, 201, created);
        } catch {
            sendJson(response, 400, {
                message: 'Corps de requête JSON invalide.'
            });
        }
        return true;
    }

    return false;
}

async function handlePut(pathname, request, response) {
    const equipmentPathMatch = pathname.match(/^\/api\/equipment\/(\d+)$/);
    if (equipmentPathMatch) {
        const equipmentId = Number.parseInt(equipmentPathMatch[1], 10);
        const equipmentIndex = equipmentData.findIndex((item) => item.id === equipmentId);

        if (equipmentIndex === -1) {
            sendNotFound(response);
            return true;
        }

        try {
            const body = await parseJsonBody(request);
            const normalized = normalizeEquipmentPayload(body);

            if (!normalized) {
                sendJson(response, 400, {
                    message: 'Payload équipement invalide.'
                });
                return true;
            }

            const updated = {
                id: equipmentId,
                ...normalized
            };

            equipmentData[equipmentIndex] = updated;
            sendJson(response, 200, updated);
        } catch {
            sendJson(response, 400, {
                message: 'Corps de requête JSON invalide.'
            });
        }
        return true;
    }

    const maintenancePathMatch = pathname.match(/^\/api\/maintenances\/(\d+)$/);
    if (maintenancePathMatch) {
        const maintenanceId = Number.parseInt(maintenancePathMatch[1], 10);
        const maintenanceIndex = maintenanceData.findIndex((record) => record.id === maintenanceId);

        if (maintenanceIndex === -1) {
            sendNotFound(response);
            return true;
        }

        try {
            const body = await parseJsonBody(request);
            const normalized = normalizeMaintenancePayload(body, false);

            if (!normalized) {
                sendJson(response, 400, {
                    message: 'Payload maintenance invalide.'
                });
                return true;
            }

            const updated = {
                id: maintenanceId,
                equipmentId: maintenanceData[maintenanceIndex].equipmentId,
                ...normalized
            };

            maintenanceData[maintenanceIndex] = updated;
            sendJson(response, 200, updated);
        } catch {
            sendJson(response, 400, {
                message: 'Corps de requête JSON invalide.'
            });
        }
        return true;
    }

    return false;
}

const server = createServer(async (request, response) => {
    setCorsHeaders(response);

    if (request.method === 'OPTIONS') {
        response.writeHead(204);
        response.end();
        return;
    }

    const parsedUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
    const { pathname } = parsedUrl;

    if (request.method === 'GET' && await handleGet(pathname, response)) {
        return;
    }

    if (request.method === 'POST' && await handlePost(pathname, request, response)) {
        return;
    }

    if (request.method === 'PUT' && await handlePut(pathname, request, response)) {
        return;
    }

    sendNotFound(response);
});

server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API server listening on http://localhost:${port}`);
});
