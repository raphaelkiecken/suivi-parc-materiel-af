import { useMemo, useState, type ReactNode } from 'react';
import './styles/equipment-page.css';
import EquipmentForm from './components/EquipmentForm';
import type { UseEquipmentReturn } from './hooks/useEquipment';
import type { EquipmentItem, MaintenanceRecord } from './types/equipment';
import { formatDate } from './utils/dateUtils';

const sortFieldOptions = [
    { value: 'purchaseDate', label: "Date d'achat" },
    { value: 'warrantyExpiration', label: 'Expiration de garantie' }
] as const;

interface EquipmentProps {
    equipment: UseEquipmentReturn;
    maintenanceList: MaintenanceRecord[];
    onAddMaintenanceForEquipment: (equipmentId: number) => void;
}

export default function Equipment({ equipment, maintenanceList, onAddMaintenanceForEquipment }: Readonly<EquipmentProps>) {
    const [isMaintenanceHistoryVisible, setIsMaintenanceHistoryVisible] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [requestedPage, setRequestedPage] = useState(1);

    const totalItems = equipment.displayedEquipmentList.length;
    const totalPages = useMemo(() => Math.max(1, Math.ceil(totalItems / itemsPerPage)), [itemsPerPage, totalItems]);
    const currentPage = Math.min(requestedPage, totalPages);
    const paginatedEquipmentList = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return equipment.displayedEquipmentList.slice(startIndex, startIndex + itemsPerPage);
    }, [currentPage, equipment.displayedEquipmentList, itemsPerPage]);

    function toggleMaintenanceHistoryVisibility() {
        setIsMaintenanceHistoryVisible((currentValue) => {
            if (currentValue) {
                return false;
            }
            return true;
        });
    }

    function renderEquipmentItem(item: EquipmentItem) {
        const { id, name, brand, model, serialNumber, purchaseDate, warrantyExpiration, status, position } = item;

        function openEquipmentSheet() {
            setIsMaintenanceHistoryVisible(false);
            equipment.openReadOnlyEquipmentForm(item);
        }

        return (
            <tr
                key={id}
                className="clickable-row"
                onClick={openEquipmentSheet}
                title="Cliquer pour ouvrir la fiche"
            >
                <td data-label="Nom">{name}</td>
                <td data-label="Marque">{brand}</td>
                <td data-label="Modele">{model}</td>
                <td data-label="Numero de serie">{serialNumber}</td>
                <td data-label="Date d'achat">{formatDate(purchaseDate)}</td>
                <td data-label="Expiration de garantie">{formatDate(warrantyExpiration)}</td>
                <td data-label="Statut">{status}</td>
                <td data-label="Position">{position}</td>
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
                        onChange={(event) => {
                            setRequestedPage(1);
                            equipment.setSearchQuery(event.target.value);
                        }}
                        placeholder="Nom, marque, modèle, n° série..."
                    />
                </label>

                <label className="control-field">
                    <span>Lieu</span>
                    <select
                        value={equipment.locationFilter}
                        onChange={(event) => {
                            setRequestedPage(1);
                            equipment.setLocationFilter(event.target.value);
                        }}
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
                        onChange={(event) => {
                            setRequestedPage(1);
                            equipment.setSortField(event.target.value as typeof equipment.sortField);
                        }}
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
                        onChange={(event) => {
                            setRequestedPage(1);
                            equipment.setSortDirection(event.target.value as typeof equipment.sortDirection);
                        }}
                    >
                        <option value="asc">Croissant</option>
                        <option value="desc">Décroissant</option>
                    </select>
                </label>

                <label className="control-field">
                    <span>Par page</span>
                    <select
                        value={itemsPerPage}
                        onChange={(event) => {
                            setRequestedPage(1);
                            setItemsPerPage(Number(event.target.value));
                        }}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </label>

                <button
                    type="button"
                    className="btn-secondary controls-reset"
                    onClick={() => {
                        setRequestedPage(1);
                        equipment.resetFilters();
                    }}
                >
                    Réinitialiser
                </button>
            </section>
        );
    }

    function renderEquipmentModal() {
        let modalTitle = 'Ajouter un équipement';
        if (equipment.isReadOnlyEquipmentModal) {
            modalTitle = 'Fiche équipement';
        } else if (equipment.isEditingEquipment) {
            modalTitle = 'Modifier un équipement';
        }

        const currentEquipmentId = equipment.editingEquipmentId;
        const publicEquipmentUrl = currentEquipmentId === null
            ? ''
            : `${window.location.origin}/fiche/equipement/${currentEquipmentId}`;
        const qrCodeImageUrl = publicEquipmentUrl === ''
            ? ''
            : `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(publicEquipmentUrl)}`;
        const equipmentMaintenances = currentEquipmentId === null
            ? []
            : maintenanceList
                .filter((record) => record.equipmentId === currentEquipmentId)
                .sort((left, right) => right.date.localeCompare(left.date));
        let historyToggleLabel = 'Afficher la liste';
        if (isMaintenanceHistoryVisible) {
            historyToggleLabel = 'Masquer la liste';
        }
        let historyContent: ReactNode = null;
        if (isMaintenanceHistoryVisible) {
            if (equipmentMaintenances.length === 0) {
                historyContent = <p className="equipment-sheet-maintenance-empty">Aucune maintenance enregistrée pour cet équipement.</p>;
            } else {
                historyContent = (
                    <ul className="equipment-sheet-maintenance-list">
                        {equipmentMaintenances.map((record) => (
                            <li key={record.id}>
                                <strong>{formatDate(record.date)}</strong> - {record.interventionType} ({record.interventionStatus}) - {record.description}
                            </li>
                        ))}
                    </ul>
                );
            }
        }

        return (
            <div className="modal-overlay">
                <div className="modal">
                    <div className="modal-header">
                        <h3>{modalTitle}</h3>
                        <div className="modal-header-actions">
                            {equipment.isReadOnlyEquipmentModal && (
                                <button
                                    type="button"
                                    className="btn-primary"
                                    onClick={equipment.enableEquipmentEditMode}
                                >
                                    Modifier la fiche
                                </button>
                            )}
                            <button type="button" className="btn-secondary" onClick={equipment.closeEquipmentForm}>
                                Fermer
                            </button>
                        </div>
                    </div>
                    <EquipmentForm equipment={equipment} onCancel={equipment.closeEquipmentForm} />

                    {currentEquipmentId !== null && (
                        <section className="equipment-sheet-qr">
                            <h4>Accès direct fiche (QR)</h4>
                            <p>Scannez ce QR code pour ouvrir uniquement la fiche de cet équipement.</p>
                            <div className="equipment-sheet-qr-content">
                                <img src={qrCodeImageUrl} alt="QR code d'accès direct à la fiche équipement" />
                                <a href={publicEquipmentUrl} target="_blank" rel="noreferrer">
                                    Ouvrir la fiche directe
                                </a>
                            </div>
                        </section>
                    )}

                    {currentEquipmentId !== null && (
                        <section className="equipment-sheet-maintenance">
                            <div className="equipment-sheet-maintenance-header">
                                <h4>Historique des maintenances ({equipmentMaintenances.length})</h4>
                                <div className="equipment-sheet-maintenance-actions">
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={toggleMaintenanceHistoryVisibility}
                                    >
                                        {historyToggleLabel}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-primary"
                                        onClick={() => onAddMaintenanceForEquipment(currentEquipmentId)}
                                    >
                                        Ajouter une maintenance
                                    </button>
                                </div>
                            </div>

                            {historyContent}
                        </section>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="equipment">
            <div className="equipment-header">
                <h2>Équipements</h2>
                <button type="button" className="btn-primary" onClick={equipment.openAddEquipmentForm}>
                    Ajouter un équipement
                </button>
            </div>

            {renderSearchAndSortControls()}

            <p className="equipment-results-count">
                {equipment.displayedEquipmentList.length} équipement(s) affiché(s)
            </p>

            {totalItems > itemsPerPage && (
                <nav className="list-pagination" aria-label="Pagination équipements">
                    <p className="list-pagination-meta">Page {currentPage} / {totalPages}</p>
                    <div className="list-pagination-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setRequestedPage((page) => Math.max(1, page - 1))}
                            disabled={currentPage === 1}
                        >
                            Précédent
                        </button>
                        <div className="list-pagination-pages">
                            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                                <button
                                    key={pageNumber}
                                    type="button"
                                    className={`btn-secondary ${pageNumber === currentPage ? 'btn-secondary-active' : ''}`}
                                    onClick={() => setRequestedPage(pageNumber)}
                                >
                                    {pageNumber}
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setRequestedPage((page) => Math.min(totalPages, page + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Suivant
                        </button>
                    </div>
                </nav>
            )}

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
                        {paginatedEquipmentList.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="empty-table-cell">
                                    Aucun équipement ne correspond à vos filtres.
                                </td>
                            </tr>
                        ) : (
                            paginatedEquipmentList.map(renderEquipmentItem)
                        )}
                    </tbody>
                </table>
            </div>

            {equipment.isEquipmentFormOpen && renderEquipmentModal()}
        </div>
    );
}
