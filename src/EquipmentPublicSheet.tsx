import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPublicEquipmentSheet, type PublicEquipmentSheetData } from './services/publicEquipmentApi';
import { formatDate } from './utils/dateUtils';
import './styles/equipment-page.css';

export default function EquipmentPublicSheet() {
    const { equipmentId } = useParams();
    const [sheetData, setSheetData] = useState<PublicEquipmentSheetData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        let isCancelled = false;

        async function loadSheet() {
            if (!equipmentId) {
                setErrorMessage('Identifiant d\'équipement manquant.');
                setIsLoading(false);
                return;
            }

            const parsedEquipmentId = Number(equipmentId);
            if (Number.isNaN(parsedEquipmentId)) {
                setErrorMessage('Identifiant d\'équipement invalide.');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setErrorMessage(null);

            try {
                const data = await fetchPublicEquipmentSheet(parsedEquipmentId);
                if (!isCancelled) {
                    setSheetData(data);
                }
            } catch {
                if (!isCancelled) {
                    setErrorMessage('Impossible de charger la fiche équipement.');
                    setSheetData(null);
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        }

        void loadSheet();

        return () => {
            isCancelled = true;
        };
    }, [equipmentId]);

    if (isLoading) {
        return (
            <main className="equipment-public-page">
                <article className="equipment-public-card">
                    <h1>Fiche équipement</h1>
                    <p>Chargement...</p>
                </article>
            </main>
        );
    }

    if (errorMessage || !sheetData) {
        return (
            <main className="equipment-public-page">
                <article className="equipment-public-card">
                    <h1>Fiche équipement</h1>
                    <p>{errorMessage ?? 'Équipement introuvable.'}</p>
                </article>
            </main>
        );
    }

    const { equipment, maintenances } = sheetData;

    return (
        <main className="equipment-public-page">
            <article className="equipment-public-card">
                <h1>Fiche équipement</h1>
                <p className="equipment-public-subtitle">Consultation rapide via QR code</p>

                <dl className="equipment-public-grid">
                    <div>
                        <dt>Nom</dt>
                        <dd>{equipment.name}</dd>
                    </div>
                    <div>
                        <dt>Marque</dt>
                        <dd>{equipment.brand}</dd>
                    </div>
                    <div>
                        <dt>Modèle</dt>
                        <dd>{equipment.model}</dd>
                    </div>
                    <div>
                        <dt>Numéro de série</dt>
                        <dd>{equipment.serialNumber}</dd>
                    </div>
                    <div>
                        <dt>Date d'achat</dt>
                        <dd>{formatDate(equipment.purchaseDate)}</dd>
                    </div>
                    <div>
                        <dt>Expiration de garantie</dt>
                        <dd>{formatDate(equipment.warrantyExpiration)}</dd>
                    </div>
                    <div>
                        <dt>Statut</dt>
                        <dd>{equipment.status}</dd>
                    </div>
                    <div>
                        <dt>Position</dt>
                        <dd>{equipment.position}</dd>
                    </div>
                </dl>

                <section className="equipment-sheet-maintenance">
                    <div className="equipment-sheet-maintenance-header">
                        <h4>Historique des maintenances ({maintenances.length})</h4>
                    </div>

                    {maintenances.length === 0 ? (
                        <p className="equipment-sheet-maintenance-empty">Aucune maintenance enregistrée pour cet équipement.</p>
                    ) : (
                        <ul className="equipment-sheet-maintenance-list">
                            {maintenances.map((record) => (
                                <li key={record.id}>
                                    <strong>{formatDate(record.date)}</strong> - {record.interventionType} ({record.interventionStatus}) - {record.description} - {record.downtimeMinutes} min
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </article>
        </main>
    );
}
