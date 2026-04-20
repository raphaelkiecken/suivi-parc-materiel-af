import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import type { EquipmentItem } from './types/equipment';
import { formatDate } from './utils/dateUtils';
import './styles/equipment-page.css';

interface EquipmentPublicSheetProps {
    equipmentList: EquipmentItem[];
}

export default function EquipmentPublicSheet({ equipmentList }: Readonly<EquipmentPublicSheetProps>) {
    const { equipmentId } = useParams();

    const equipment = useMemo(() => {
        const parsedId = Number(equipmentId);
        if (Number.isNaN(parsedId)) {
            return null;
        }

        return equipmentList.find((item) => item.id === parsedId) ?? null;
    }, [equipmentId, equipmentList]);

    if (!equipment) {
        return (
            <main className="equipment-public-page">
                <article className="equipment-public-card">
                    <h1>Fiche équipement</h1>
                    <p>Équipement introuvable.</p>
                </article>
            </main>
        );
    }

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
            </article>
        </main>
    );
}
