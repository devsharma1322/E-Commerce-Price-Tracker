import { LineChart, Tag, TrendingDown, TrendingUp } from "lucide-react";

interface Props {
    title: String;
    value: String;
}

const PriceInfoCard = ({ title, value }: Props) => {
    return (
        <div className={`price-info_card`}>
            <p className="text-base text-black-100">{title}</p>
            <div className="flex gap-1">
                {title === 'Current Price' ? (
                    <Tag className="w-[24px] h-[24px]" />
                ) : null}
                {title === 'Average Price' ? (
                    <LineChart className="w-[24px] h-[24px]" />
                ) : null}
                {title === 'Highest Price' ? (
                    <TrendingUp className="w-[24px] h-[24px]" />
                ) : null}
                {title === 'Lowest Price' ? (
                    <TrendingDown className="w-[24px] h-[24px]" />
                ) : null}
                <p className="text-2xl font-bold text-secondary">{value}</p>
            </div>
        </div>
    )
}

export default PriceInfoCard