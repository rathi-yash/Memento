import { Button } from "./ui/button";

const Pagination = ({
    setPage,
    page,
    totalPages,
}: {
    setPage: React.Dispatch<React.SetStateAction<number>>;
    page: number;
    totalPages: number;
}) => {
    const handleNextPage = () => {
        if (totalPages && page < totalPages) {
            setPage((prev) => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (page > 1) {
            setPage((prev) => prev - 1);
        }
    };

    return (
        <div className="flex gap-2">
            <Button
                onClick={() => setPage(1)}
                variant="outline"
                size="sm"
                disabled={page === 1}
            >
                First
            </Button>
            <Button
                onClick={handlePrevPage}
                variant="outline"
                size="sm"
                disabled={page === 1}
            >
                Prev
            </Button>

            {(() => {
                const pageNumbers = [];
                const currentPage = page;
                const maxVisiblePages = 5;

                if (totalPages <= maxVisiblePages) {
                    for (let i = 1; i <= totalPages; i++) {
                        pageNumbers.push(i);
                    }
                } else {
                    if (currentPage <= 3) {
                        for (let i = 1; i <= 4; i++) {
                            pageNumbers.push(i);
                        }
                        pageNumbers.push("...");
                        pageNumbers.push(totalPages);
                    } else if (currentPage >= totalPages - 2) {
                        pageNumbers.push(1);
                        pageNumbers.push("...");
                        for (let i = totalPages - 3; i <= totalPages; i++) {
                            pageNumbers.push(i);
                        }
                    } else {
                        pageNumbers.push(1);
                        pageNumbers.push("...");
                        for (
                            let i = currentPage - 1;
                            i <= currentPage + 1;
                            i++
                        ) {
                            pageNumbers.push(i);
                        }
                        pageNumbers.push("...");
                        pageNumbers.push(totalPages);
                    }
                }

                return pageNumbers.map((pageNum, index) => (
                    <Button
                        key={index}
                        onClick={() =>
                            pageNum !== "..." && setPage(pageNum as number)
                        }
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        disabled={pageNum === "..."}
                    >
                        {pageNum}
                    </Button>
                ));
            })()}

            <Button
                onClick={handleNextPage}
                variant="outline"
                size="sm"
                disabled={page === totalPages}
            >
                Next
            </Button>
            <Button
                onClick={() => setPage(totalPages)}
                variant="outline"
                size="sm"
                disabled={page === totalPages}
            >
                Last
            </Button>
        </div>
    );
};
export default Pagination;
