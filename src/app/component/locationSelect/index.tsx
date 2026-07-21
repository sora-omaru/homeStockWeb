import { LocationResponseDto } from "@/types/location/location";

type LocationSelectProps = {
  locations: LocationResponseDto[];
  value: number | null;
  isLoading: boolean;
  error: string | null;
  onChange: (locationId: number | null) => void;
};
//Location情報を読み込んで選択させるコンポーネント
export default function LocationSelect({
  locations,
  value,
  isLoading,
  error,
  onChange,
}: LocationSelectProps) {
  return (
    <>
      <select
        name="location"
        id="location"
        disabled={isLoading || error !== null}
        value={value ?? ""}
        onChange={(e) => {
          const nextValue = e.target.value;
          console.log(nextValue);
          onChange(nextValue === "" ? null : Number(nextValue));
        }}
      >
        <option value="">保管場所 未設定</option>

        {locations.map((location) => (
          <option key={location.id} value={location.id}>
            {location.name}
          </option>
        ))}
      </select>

      {isLoading && <p>Locationを取得中...</p>}
      {error && <p>{error}</p>}
      {!isLoading && !error && locations.length === 0 && (
        <p>Locationが登録されていません。</p>
      )}
    </>
  );
}
