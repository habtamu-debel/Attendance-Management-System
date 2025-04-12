function Footer(){
    return(
        <footer className="fixed h-25 bottom-0 left-4 ml-1  w-full bg-gray-800 text-white py-4">
            <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between">
                
                <div>
                <h2 className="text-lg font-semibold mb-2">Footer</h2>
                <p className="text-sm">Copyright reserved ©️ General Winget Polytechnic College</p>
                <p className="text-sm">Addis Ababa, Ethiopia</p>
                </div>

                <div>
                <h3 className="text-lg font-semibold mb-2">Sidebar ketach</h3>
                <p className="text-sm">Call:</p>
                <p className="text-sm">0112799182</p>
                <p className="text-sm">0112799532</p>
                </div>

            </div>
        </footer>
    );
}

export default Footer;