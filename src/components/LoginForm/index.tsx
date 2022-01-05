

export default function LoginForm() {
    return (
        <form className="container row p-1 center">
            <div className="col" style={{ maxWidth: "28rem"}}>
                <h3>Boston Children's Hospital</h3>
                <div className="row center">
                    <div className="col">
                        <label>Email</label>
                        <input type="text"/>
                        <label className="mt-1">Password</label>
                        <input type="password"/>
                        <button type="submit" className="btn-blue mt-2 mb-2">Login</button>
                    </div>
                </div>
            </div>
        </form>
    )
}
