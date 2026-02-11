import 'FlyingInput.css'

type FlyingInputProps = {
    label: string,
    type: string, 
    disabled: boolean,
    onType: Function,
    superiorDivClassName: string,
    inputValue: string,
}

const FlyingInput = ({ label, type, disabled, onType, superiorDivClassName, inputValue }: FlyingInputProps) => {
        return (
            <div className={`relative ${superiorDivClassName}`}>
                <input
                    type={type}
                    id={label}
                    className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-600 dark:focus:border-red-500 focus:outline-none focus:ring-0 focus:border-red-600 peer flyingtextinput"
                    placeholder=" "
                    onChange={(e) => onType(e.target.value)}
                    value={inputValue ?? ""}
                    disabled={disabled}
                />
                <label
                    htmlFor={label}
                    className={`absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-red-600 peer-focus:dark:text-red-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 ${disabled ? "flyingtextinputlabel" : ""}`}
                >
                    {label}
                </label>
            </div>
        )
}

export default FlyingInput;