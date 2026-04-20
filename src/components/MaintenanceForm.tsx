import type { EquipmentItem } from '../types/equipment';
import type { UseMaintenanceReturn } from '../hooks/useMaintenance';

interface MaintenanceFormProps {
    maintenance: UseMaintenanceReturn;
    equipmentList: EquipmentItem[];
    onCancel: () => void;
}

export default function MaintenanceForm({ maintenance, equipmentList, onCancel }: Readonly<MaintenanceFormProps>) {
    const isReadOnly = maintenance.isReadOnlyMaintenanceModal;
    const equipmentSelectDisabled = maintenance.isEditingMaintenance || isReadOnly;
    let submitLabel = 'Ajouter';
    if (maintenance.isEditingMaintenance) {
        submitLabel = 'Enregistrer les modifications';
    }

    return (
        <form className="maintenance-form" onSubmit={maintenance.handleMaintenanceSubmit}>
            <label>
                <span>Équipement</span>
                <select
                    value={maintenance.selectedEquipmentId ?? ''}
                    onChange={(event) => maintenance.setSelectedEquipmentId(Number(event.target.value))}
                    disabled={equipmentSelectDisabled}
                    required
                >
                    {equipmentList.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.name} - {item.serialNumber}
                        </option>
                    ))}
                </select>
            </label>
            <label>
                <span>Date</span>
                <input
                    type="date"
                    name="date"
                    value={maintenance.maintenanceFormData.date}
                    onChange={maintenance.handleMaintenanceFieldChange}
                    disabled={isReadOnly}
                    required
                />
            </label>
            <label>
                <span>Type de maintenance</span>
                <select
                    name="interventionType"
                    value={maintenance.maintenanceFormData.interventionType}
                    onChange={maintenance.handleMaintenanceFieldChange}
                    disabled={isReadOnly}
                    required
                >
                    <option value="Préventive">Préventive</option>
                    <option value="Corrective">Corrective</option>
                </select>
            </label>
            <label>
                <span>Statut</span>
                <select
                    name="interventionStatus"
                    value={maintenance.maintenanceFormData.interventionStatus}
                    onChange={maintenance.handleMaintenanceFieldChange}
                    disabled={isReadOnly}
                    required
                >
                    <option value="Planifiée">Planifiée</option>
                    <option value="En cours">En cours</option>
                    <option value="Terminée">Terminée</option>
                </select>
            </label>
            <label>
                <span>Description</span>
                <input
                    name="description"
                    value={maintenance.maintenanceFormData.description}
                    onChange={maintenance.handleMaintenanceFieldChange}
                    disabled={isReadOnly}
                    required
                />
            </label>
            <label>
                <span>Effectuée par</span>
                <input
                    name="performedBy"
                    value={maintenance.maintenanceFormData.performedBy}
                    onChange={maintenance.handleMaintenanceFieldChange}
                    disabled={isReadOnly}
                    required
                />
            </label>
            <label>
                <span>Durée d'immobilisation (min)</span>
                <input
                    type="number"
                    name="downtimeMinutes"
                    value={maintenance.maintenanceFormData.downtimeMinutes}
                    onChange={maintenance.handleMaintenanceFieldChange}
                    step="1"
                    min="0"
                    disabled={isReadOnly}
                    required
                />
            </label>
            <label>
                <span>Coût (€)</span>
                <input
                    type="number"
                    name="cost"
                    value={maintenance.maintenanceFormData.cost}
                    onChange={maintenance.handleMaintenanceFieldChange}
                    step="0.01"
                    min="0"
                    disabled={isReadOnly}
                    required
                />
            </label>
            <label className="maintenance-notes-field">
                <span>Notes intervention</span>
                <textarea
                    name="notes"
                    value={maintenance.maintenanceFormData.notes}
                    onChange={maintenance.handleMaintenanceFieldChange}
                    rows={3}
                    disabled={isReadOnly}
                />
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
