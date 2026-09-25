export default function LoadingState({ message = 'Carregando...' }: { message?: string }) {
	return <div className="catalog-empty loading-state" role="status" aria-live="polite"><p>{message}</p></div>;
}
