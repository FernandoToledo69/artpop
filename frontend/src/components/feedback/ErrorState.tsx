export default function ErrorState({ message = 'Não foi possível carregar os dados.' }: { message?: string }) {
	return <div className="catalog-empty error-state" role="alert"><h3>Algo deu errado</h3><p>{message}</p><button type="button" onClick={() => window.location.reload()}>Tentar novamente</button></div>;
}
