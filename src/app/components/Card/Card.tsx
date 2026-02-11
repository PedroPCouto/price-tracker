import 'Card.css'

type CardProps = {
    name: String,
    detail: String,
    value: String
}

const Card = ({name, detail, value}: CardProps) => {
    <div className="card_body">
        <header className="card_header">
            <h2 className="card_title">
                {name}
            </h2>
            <div className="card_detail">
                {detail}
            </div>
        </header>
        <div>
            {value}
        </div>
        <footer>
            <button className="delete_button">
                Excluir
            </button>
            <button className="refresh_button">
                Atualizar
            </button>
        </footer>
    </div>
}

export default Card