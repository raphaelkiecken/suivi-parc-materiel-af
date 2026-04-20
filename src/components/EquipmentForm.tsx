import type { UseEquipmentReturn } from '../hooks/useEquipment';

interface EquipmentFormProps {
    equipment: UseEquipmentReturn;
    onCancel: () => void;
}

export default function EquipmentForm({ equipment, onCancel }: Readonly<EquipmentFormProps>) {
    const isReadOnly = equipment.isReadOnlyEquipmentModal;
    let submitLabel = 'Ajouter';
    if (equipment.isEditingEquipment) {
        submitLabel = 'Enregistrer les modifications';
    }

    return (
        <form className="equipment-form" onSubmit={equipment.handleEquipmentSubmit}>
            <label>
                <span>Nom</span>
                <input name="name" value={equipment.equipmentFormData.name} onChange={equipment.handleEquipmentFieldChange} required disabled={isReadOnly} />
            </label>
            <label>
                <span>Marque</span>
                <input name="brand" value={equipment.equipmentFormData.brand} onChange={equipment.handleEquipmentFieldChange} required disabled={isReadOnly} />
            </label>
            <label>
                <span>Modèle</span>
                <input name="model" value={equipment.equipmentFormData.model} onChange={equipment.handleEquipmentFieldChange} required disabled={isReadOnly} />
            </label>
            <label>
                <span>Numéro de série</span>
                <input name="serialNumber" value={equipment.equipmentFormData.serialNumber} onChange={equipment.handleEquipmentFieldChange} required disabled={isReadOnly} />
            </label>
            <label>
                <span>Date d'achat</span>
                <input type="date" name="purchaseDate" value={equipment.equipmentFormData.purchaseDate} onChange={equipment.handleEquipmentFieldChange} required disabled={isReadOnly} />
            </label>
            <label>
                <span>Expiration de garantie</span>
                <input type="date" name="warrantyExpiration" value={equipment.equipmentFormData.warrantyExpiration} onChange={equipment.handleEquipmentFieldChange} required disabled={isReadOnly} />
            </label>
            <label>
                <span>Statut</span>
                <input name="status" value={equipment.equipmentFormData.status} onChange={equipment.handleEquipmentFieldChange} required disabled={isReadOnly} />
            </label>
            <label>
                <span>Position</span>
                <input name="position" value={equipment.equipmentFormData.position} onChange={equipment.handleEquipmentFieldChange} required disabled={isReadOnly} />
            </label>

            {!isReadOnly && (
                <div className="form-actions">
                    <button type="submit" className="btn-primary">
                        {submitLabel}
                    </button>
                    <button type="button" className="btn-secondary" onClick={onCancel}>
                        Annuler
                    </button>
                </div>
            )}
        </form>
    );
}
