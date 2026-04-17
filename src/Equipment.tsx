import './styles/equipment-page.css';
import type { UseEquipmentReturn } from './hooks/useEquipment';
import type { EquipmentItem } from './types/equipment';
import { formatDate } from './utils/dateUtils';

const sortFieldOptions = [
    { value: 'purchaseDate', label: "Date d'achat" },
    { value: 'warrantyExpiration', label: 'Expiration de garantie' }
] as const;

interface EquipmentProps {
    equipment: UseEquipmentReturn;
}

export default function Equipment({ equipment }: Readonly<EquipmentProps>) {
    function renderEquipmentItem(item: EquipmentItem) {
        const { id, name, brand, model, serialNumber, purchaseDate, warrantyExpiration, status, position } = item;
        return (
            <tr
                key={id}
                className="clickable-row"
                onClick={() => equipment.openEditModal(item)}
                title="Cliquer pour modifier"
            >
                <td>{name}</td>
                <td>{brand}</td>
                <td>{model}</td>
                <td>{serialNumber}</td>
                <td>{formatDate(purchaseDate)}</td>
                <td>{formatDate(warrantyExpiration)}</td>
                <td>{status}</td>
                <td>{position}</td>
            </tr>
        );
    }

    function renderSearchAndSortControls() {
        return (
            <section className="equipment-controls">
                <label className="control-field">
                    <span>Recherche</span>
                    <input
                        type="text"
                        value={equipment.searchQuery}
                        onChange={(event) => equipment.setSearchQuery(event.target.value)}
                        placeholder="Nom, marque, modèle, n° série..."
                    />
                </label>

                <label className="control-field">
                    <span>Lieu</span>
                    <select
                        value={equipment.locationFilter}
                        onChange={(event) => equipment.setLocationFilter(event.target.value)}
                    >
                        <option value="">Tous les lieux</option>
                        {equipment.availableLocations.map((location) => (
                            <option key={location} value={location}>
                                {location}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="control-field">
                    <span>Trier par</span>
                    <select
                        value={equipment.sortField}
                        onChange={(event) => equipment.setSortField(event.target.value as typeof equipment.sortField)}
                    >
                        {sortFieldOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="control-field">
                    <span>Ordre</span>
                    <select
                        value={equipment.sortDirection}
                        onChange={(event) => equipment.setSortDirection(event.target.value as typeof equipment.sortDirection)}
                    >
                        <option value="asc">Croissant</option>
                        <option value="desc">Décroissant</option>
                    </select>
                </label>

                <button type="button" className="btn-secondary controls-reset" onClick={equipment.resetFilters}>
                    Réinitialiser
                </button>
            </section>
        );
    }

    function renderEquipmentForm() {
        return (
            <form className="equipment-form" onSubmit={equipment.handleSubmit}>
                <label>
                    <span>Nom</span>
                    <input name="name" value={equipment.formData.name} onChange={equipment.handleFieldChange} required disabled={equipment.isReadOnlyModal} />
                </label>
                <label>
                    <span>Marque</span>
                    <input name="brand" value={equipment.formData.brand} onChange={equipment.handleFieldChange} required disabled={equipment.isReadOnlyModal} />
                </label>
                <label>
                    <span>Modèle</span>
                    <input name="model" value={equipment.formData.model} onChange={equipment.handleFieldChange} required disabled={equipment.isReadOnlyModal} />
                </label>
                <label>
                    <span>Numéro de série</span>
                    <input name="serialNumber" value={equipment.formData.serialNumber} onChange={equipment.handleFieldChange} required disabled={equipment.isReadOnlyModal} />
                </label>
                <label>
                    <span>Date d'achat</span>
                    <input type="date" name="purchaseDate" value={equipment.formData.purchaseDate} onChange={equipment.handleFieldChange} required disabled={equipment.isReadOnlyModal} />
                </label>
                <label>
                    <span>Expiration de garantie</span>
                    <input type="date" name="warrantyExpiration" value={equipment.formData.warrantyExpiration} onChange={equipment.handleFieldChange} required disabled={equipment.isReadOnlyModal} />
                </label>
                <label>
                    <span>Statut</span>
                    <input name="status" value={equipment.formData.status} onChange={equipment.handleFieldChange} required disabled={equipment.isReadOnlyModal} />
                </label>
                <label>
                    <span>Position</span>
                    <input name="position" value={equipment.formData.position} onChange={equipment.handleFieldChange} required disabled={equipment.isReadOnlyModal} />
                </label>

                {!equipment.isReadOnlyModal && (
                    <div className="form-actions">
                        <button type="submit" className="btn-primary">
                            {equipment.isEditing ? 'Enregistrer les modifications' : 'Ajouter'}
                        </button>
                    </div>
                )}
            </form>
        );
    }

    function renderEquipmentModal() {
        let modalTitle = 'Ajouter un équipement';
        if (equipment.isReadOnlyModal) {
            modalTitle = 'Fiche équipement';
        } else if (equipment.isEditing) {
            modalTitle = 'Modifier un équipement';
        }

        return (
            <div className="modal-overlay">
                <div className="modal">
                    <div className="modal-header">
                        <h3>{modalTitle}</h3>
                        <button type="button" className="btn-secondary" onClick={equipment.closeModal}>
                            Fermer
                        </button>
                    </div>
                    {renderEquipmentForm()}
                </div>
            </div>
        );
    }

    return (
        <div className="equipment">
            <div className="equipment-header">
                <h2>Équipements</h2>
                <button type="button" className="btn-primary" onClick={equipment.openAddModal}>
                    Ajouter un équipement
                </button>
            </div>

            {renderSearchAndSortControls()}

            <p className="equipment-results-count">
                {equipment.displayedEquipmentList.length} équipement(s) affiché(s)
            </p>

            <div className="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Marque</th>
                            <th>Modèle</th>
                            <th>Numéro de série</th>
                            <th>Date d'achat</th>
                            <th>Expiration de garantie</th>
                            <th>Statut</th>
                            <th>Position</th>
                        </tr>
                    </thead>
                    <tbody>
                        {equipment.displayedEquipmentList.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="empty-table-cell">
                                    Aucun équipement ne correspond à vos filtres.
                                </td>
                            </tr>
                        ) : (
                            equipment.displayedEquipmentList.map(renderEquipmentItem)
                        )}
                    </tbody>
                </table>
            </div>

            {equipment.isModalOpen && renderEquipmentModal()}
        </div>
    );
}
