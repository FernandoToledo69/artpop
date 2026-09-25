export default function EmptyState({ title = 'Nenhum resultado encontrado', message = 'Não há dados para exibir.' }: { title?: string; message?: string }) {
	return <div className="catalog-empty"><h3>{title}</h3><p>{message}</p></div>;
}
