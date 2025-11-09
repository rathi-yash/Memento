import { Oval } from "react-loader-spinner";

const Loading = () => {
    return (
        <div className={`flex h-full w-full items-center justify-center`}>
            <Oval
                height={80}
                width={80}
                color="rgb(15, 103, 254)"
                wrapperStyle={{}}
                wrapperClass=""
                visible={true}
                ariaLabel="oval-loading"
                secondaryColor="rgba(15, 103, 254, 0.4)"
                strokeWidth={2}
                strokeWidthSecondary={2}
            />
        </div>
    );
};

export default Loading;
