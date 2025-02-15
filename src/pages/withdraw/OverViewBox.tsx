import { NextPage } from 'next';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';

const Item = ({ label, value }) => {
  return (
    <div className="flex justify-between">
      <p className="">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
};

const OverViewBox: NextPage = () => {
  return (
    <div className="flex items-center justify-center  bg-gradient-to-t to-[rgba(0,0,0,0.1024)] from-[rgba(226,226,226,0.06)] py-4 px-6 font-light">
      <div className="w-3/5 flex flex-col gap-1 text-sm">
        <div className="font-bold text-center text-lg pb-1">Transaction Overview</div>
        <Item label="Amount to repay:" value="10 OUSD" />
        <div className="flex justify-between">
          <div>
            <LocalGasStationIcon /> Gas:
          </div>
          <p className="font-semibold">0.0327459XLM</p>
        </div>
        <Item label="Your total borrowed:" value="120.73 OUSD" />
        <Item label="Borrow capacity:" value="$64.52" />
        <Item label="Borrow limit:" value="65.17%" />
      </div>
    </div>
  );
};

export default OverViewBox;
